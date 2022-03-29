(function(exports){
  "use strict";

  let VideoPlayerController = function(){
    EventsHandler.call(this, [
      "loadComplete",
      "playerError",
      "buttonPress",
      "show",
      "hide",
      "close",
      "updateViewTime",
      "networkDisconnect",
      "networkReconnect",
      "enterBackgroundState",
      "returnBackgroundState"
    ]);
    
    let _this = this;
    let remoteKeys = ["MediaPlayPause", "MediaPlay", "MediaStop", "MediaPause", "MediaRewind", "MediaFastForward"];
    let fadeTime = 2;

    this.playerInfo = null;
    this.videoIds = null;
    this.index = null;
    this.playbackTime = null;
    this.listenersSet = null;

    this.seekTime = null;
    this.seekDir = 0; // -1, 0, or 1
    this.seekIncrement = 0;
    const Increments = [0, 10, 20, 30, 60, 120, 300];
    this.incIndex = 0;

    this.seekInterval = null;

    this.auth = null;
    this.consumer = {};

    this.view = null;

    this.playerReady = false;
    this.playerClosed = false;
    this.stillInApp = true;

    this.analyticsManager = null;

    /**
     * Callbacks
     */
    this.createController = null; // create new controller
    this.removeSelf = null; // remove self

    this.videoEndCallback = null;

    /**
     * Initialization
     */ 
    this.init = options => {
      showSpinner();
      let args = options.args;
      let callbacks = options.callbacks;

      this.createController = callbacks.createController;
      this.removeSelf = callbacks.removeController;
      this.videoEndCallback = args.videoEndCallback;

      this.videoIds = args.videoIds;
      this.index = args.index;

      this.playbackTime = args.playbackTime || 0;
      this.auth = args.auth;
      this.consumer = args.consumer;

      this.getPlayerInfo();
    };

    this.getPlayerInfo = () => {
      zypeApi.getPlayer(this.videoIds[this.index], this.auth)
      .then(
        resp => {
          if (resp.response.body.outputs) {
            _this.trigger("loadComplete", resp.response);
          } else {
            _this.trigger("playerError", { message: "Cannot play video" });
          }
        },
        err => { _this.trigger("playerError", err); }
      );
    };

    this.setVideoPlaytime = time => {
      if (!this.videoIsOnAir()) {
        this.playbackTime = time;
        StorageManager.playbackTimes.setVideoTime(this.videoIds[this.index], time);
      }
    };
    this.deleteVideoPlaytime = () => StorageManager.playbackTimes.deleteVideoTime(this.videoIds[this.index]);

    this.getAndSaveCurrentTime = () => {
      let playerState = webapis.avplay.getState();

      if (playerState == "PLAYING" || playerState == "PAUSED" || playerState == "READY") {
        let currentTime = webapis.avplay.getCurrentTime();

        console.log("getAndSaveCurrentTime(), playerState: " + playerState);
        console.log("getAndSaveCurrentTime(), currentTime: " + currentTime);
        console.log("getAndSaveCurrentTime(), videoId: " + this.videoIds[this.index]);

        this.setVideoPlaytime(currentTime);
      }
    };

    this.videoIsOnAir = () => {
      return (this.playerInfo.body.on_air) ? true : false;
    };

    /**
     * Event handlers
     */ 
    this.handlePlayerResp = resp => {
      this.playerInfo = resp;
      if (!this.view) this.createView();
      this.prepareRemote();
      this.prepareAVPlayer();
    };

    this.handlePlayerError = err => {
      let args = {
        title: "Issue",
        message: err.message
      };

      this.createController(DialogController, args);
    };

    // create this.view
    // - ONLY call when this.playerInfo is set
    this.createView = function(){
      let video = this.playerInfo.video;

      let view = new VideoPlayerView();
      view.init({
        title: video.title,
        description: video.description,
        currentTime: 0,
        duration: video.duration || 0,
        state: "playing"
      });
      this.view = view;
    };

    /**
     * Helpers
     */ 
    this.prepareAVPlayer = () => {
      let source = this.playerInfo.body.outputs[0];

      let analyticsInfo = FormatHelpers.getAkamaiAnalytics(this.playerInfo, this.consumer);
      this.analyticsManager = new VideoAnalyticsManager(analyticsInfo);

      try {
        if (_this.listenersSet) {
          webapis.avplay.restore(source.url);
          _this.setViewState("playing");
        } else {
          webapis.avplay.open(source.url);
        }
        if (!_this.listenersSet) {
          webapis.avplay.setListener({
            oncurrentplaytime: function(currentTime){
              console.log("VideoPlayerController oncurrentplaytime(): Current time is " + currentTime);
              // _this.setVideoPlaytime(currentTime);
              _this.trigger("updateViewTime");
            },
            onstreamcompleted: function(){
              console.log("VideoPlayerController onstreamcompleted()");
              _this.deleteVideoPlaytime();
              _this.analyticsManager.handleEnd("Play ended");

              // update video details view
              _this.videoEndCallback();

              // get next index and set playtime
              let videoId = _this.videoIds[_this.index + 1];
              if (videoId) {
                _this.index = _this.index + 1;
              } else {
                _this.index = 0;
              }
              _this.playbackTime = 0;

              // hide player controls
              // _this.view.trigger("close");
              // _this.view = null;
              _this.resetRemote();
              $("#zype-video-player").addClass("invisible");
              showSpinner();

              // get new player info
              _this.getPlayerInfo();
            },
            onevent: function(eventType, eventData) {
              console.log("VideoPlayerController onevent()");
              console.log("\tEvent type error : " + eventType + ", data: " + eventData);
            },
            onerror: function(eventType){
              console.log("VideoPlayerController onerror(): " + eventType);
              _this.analyticsManager.handleError();
            },
            onbufferingstart: function(){
              console.log("VideoPlayerController onbufferingstart()");
              _this.analyticsManager.handleBufferStart();
            },
            onbufferingprogress: function(percent){
              console.log("VideoPlayerController onbufferingprogress(): " + percent);
            },
            onbufferingcomplete: function(){
              console.log("VideoPlayerController onbufferingcomplete()");
              _this.analyticsManager.handleBufferEnd();
              hideSpinner();
              _this.playerReady = true;

              if (webapis.avplay.getState() != "PAUSED") {
                webapis.avplay.play();
                _this.setViewState("playing");
              } else {
                _this.setViewState("paused");
              }
            }
          });
        }

        _this.listenersSet = true;

        let avplayBaseWidth = 1920;
        let ratio = avplayBaseWidth / window.document.documentElement.clientWidth;

        let displaySettings = { position: "absolute", top: 0, left: 0, width: 1920 * ratio, height: 1080 * ratio, "z-index": 1000};

        webapis.avplay.setDisplayRect(displaySettings.top,displaySettings.left, displaySettings.width, displaySettings.height);
        $("#zype-video-player").css(displaySettings);
        $("#zype-video-player").removeClass("invisible");

        webapis.avplay.prepareAsync(
          function(){
            if (!_this.stillInApp) { // user left the app during load
              _this.setViewState("paused");

              hideSpinner();
              _this.playerReady = true;
              webapis.avplay.pause();

              console.log("AVPlayer prepareAsync: pausing");
            }
            else if (!_this.playerClosed) { // user still in player
              _this.setViewState("playing");

              hideSpinner();
              _this.playerReady = true;

              _this.analyticsManager.handleInitSession();
              _this.analyticsManager.handlePlay();

              let playCb = () => {
                webapis.avplay.play();
              };
              webapis.avplay.seekTo(_this.playbackTime, playCb, playCb);

              console.log("AVPlayer prepareAsync: playing");
            }
            else { // user left player
              hideSpinner();
              console.log("AVPlayer prepareAsync: user left");
            }
          },
          function(){ console.log("AVPlayer prepareAsync: error"); }
        );
      } catch(e){
        hideSpinner();
        _this.removeSelf();
        console.log("AVPlayer prepareAsync: error preparing player");
      }
    };

    this.setViewState = state => {
      this.view.updateDuration(this.playerInfo.video.duration);
      this.view.updateTitle(this.playerInfo.video.title);
      this.view.trigger("updateTime", this.playbackTime / 1000);
      this.view.trigger("updateState", state);
      this.view.trigger("loadComplete");
      this.view.trigger("fadeOut", fadeTime);
    };

    this.prepareRemote = () => {
      try {
        for (var i = 0; i < remoteKeys.length; i++) {
          tizen.tvinputdevice.registerKey(remoteKeys[i]);
        }
      } catch (e) {}
    };

    this.resetRemote = () => {
      try {
        for (var i = 0; i < remoteKeys.length; i++) {
          tizen.tvinputdevice.unregisterKey(remoteKeys[i]);
        }
      } catch (e) {}
    };

    // called when the video player is running
    this.updateViewCurrentTime = () => {
      try {
        let currentTime = (webapis.avplay.getCurrentTime() / 1000) || 0;

        if (this.view && currentTime){
          this.view.trigger("updateTime", currentTime);
        }
      } catch(e) {}
    };

    /**
     * Update view
     */ 
    this.show = () => {
      // if playerInfo was never received, go back
      if (!this.playerInfo) this.removeSelf();
    };

    this.hide = () => this.removeSelf();

    this.close = () => {
      this.playerClosed = true;

      if (this.view){ 
        this.view.trigger("close"); 
        this.view = null;
      }

      this.resetRemote();
      $("#zype-video-player").addClass("invisible");
      hideSpinner();
      try {
        webapis.avplay.close();
      } catch(e){}
    };

    this.updateSeekTime = () => {
      if (this.seekTime == null) this.seekTime = (webapis.avplay.getCurrentTime() / 1000) || 0;
      let newSeekTime = this.seekTime + (this.seekDir * this.seekIncrement);

      if (newSeekTime > this.playerInfo.video.duration) {
        this.seekTime = this.playerInfo.video.duration - 1; // set near the end
      } else if (newSeekTime < 0) {
        this.seekTime = 0;
      } else {
        this.seekTime = newSeekTime;
      }

      console.log("VideoPlayerController, updateViewSeekTime(): ");
      console.log("\tthis.seekTime: " + this.seekTime);
      console.log("\tthis.seekDir: " + this.seekDir);
      console.log("\tthis.seekIncrement: " + this.seekIncrement);

      this.view.trigger("updateTime", this.seekTime);
    };

    this.clearSeekInterval = () => {
      clearInterval(this.seekInterval);
      this.seekInterval = null;
    };

    this.setupSeekInterval = (dir, index) => {
      this.seekDir = dir;
      if (index >= 0 && index < Increments.length) this.incIndex = index;
      this.seekIncrement = Increments[this.incIndex];

      if (this.seekInterval) this.clearSeekInterval();
      this.seekInterval = setInterval(this.updateSeekTime, 500);

      let scrubState = (dir >= 0) ? "ff" : "rw";
      this.view.setScrub(scrubState, this.seekIncrement);
    };

    this.seekCleanup = () => {
      this.seekTime = null;
      this.seekDir = 0;
      this.seekIncrement = 0;
      this.incIndex = 0;
      this.clearSeekInterval();
    };

    // go to seekTime then cleanup
    this.goToSeekTime = () => {
      if (this.seekInterval) this.clearSeekInterval(); // stop updating seekTime
      if (this.seekTime != null) {
        webapis.avplay.seekTo(this.seekTime * 1000);
        this.seekCleanup();
      }
    };

    /**
     * Button Presses
     */ 
    this.handleButtonPress = buttonPress => {
      console.log("VideoPlayerController handleButtonPress(), player state: " + webapis.avplay.getState());

      switch (buttonPress) {
        case TvKeys.LEFT:
        case TvKeys.RW:
          if (this.playerReady) {
            try {
              this.view.fadeIn();
              webapis.avplay.pause();

              if (this.seekDir == -1) {
                if (this.incIndex < Increments.length - 1) {
                  this.setupSeekInterval(this.seekDir, this.incIndex + 1);
                } else {
                  this.setupSeekInterval(this.seekDir, 1);
                }
              } else {
                this.setupSeekInterval(-1, 1); // set to rewind in 10 sec increments
              }

            } catch (error) {}
          }

          break;

        case TvKeys.RIGHT:
        case TvKeys.FF:
          if (this.playerReady) {
            try {
              this.view.fadeIn();
              webapis.avplay.pause();

              if (this.seekDir == 1) {
                if (this.incIndex < Increments.length - 1) {
                  this.setupSeekInterval(this.seekDir, this.incIndex + 1);
                } else {
                  this.setupSeekInterval(this.seekDir, 1);
                }
              } else {
                this.setupSeekInterval(1, 1); // set to fast forward in 10 sec increments
              }

            } catch (error) {}
          }
          break;

        case TvKeys.ENTER:
        case TvKeys.PLAYPAUSE:
          try {
            this.goToSeekTime();
            let state = webapis.avplay.getState();

            this.getAndSaveCurrentTime();
            this.updateViewCurrentTime();

            if (state == "PAUSED") {
              this.view.trigger("updateState", "playing");

              this.view.fadeIn();
              this.view.fadeOut(fadeTime);

              webapis.avplay.play();
              this.analyticsManager.handlePlay();
            } else {
              this.view.trigger("updateState", "paused");
              this.view.fadeIn();

              webapis.avplay.pause();
              this.analyticsManager.handlePause();
            }
            this.playerReady = true;
          } catch (error) {}
          break;

        case TvKeys.PLAY:
          try {
            this.goToSeekTime();

            this.getAndSaveCurrentTime();
            this.updateViewCurrentTime();
            this.view.trigger("updateState", "playing");
            this.view.fadeIn();
            this.view.fadeOut(fadeTime);

            webapis.avplay.play();
            this.analyticsManager.handlePlay();
            this.playerReady = true;
          } catch (error) {}
          break;
        case TvKeys.PAUSE:
          try {
            this.goToSeekTime();

            this.getAndSaveCurrentTime();
            this.updateViewCurrentTime();
            this.view.trigger("updateState", "paused");
            this.view.fadeIn();
            webapis.avplay.pause();
            this.analyticsManager.handlePause();
            this.playerReady = true;
          } catch (error) {}
          break;
        case TvKeys.STOP:
          try {
            if (this.seekInterval) this.seekCleanup();
            if (this.analyticsManager) this.analyticsManager.handleEnd("Viewer stopping watching");
            this.getAndSaveCurrentTime();
            this.removeSelf();
          } catch(error) { console.log(error); }
          break;
        case TvKeys.BACK:
        case TvKeys.RETURN:
          try {
            if (this.seekInterval) this.seekCleanup();
            if (this.analyticsManager) this.analyticsManager.handleEnd("Viewer stopping watching");
            this.getAndSaveCurrentTime();
            this.removeSelf();
          } catch(error) { console.log(error); }
          break;
        default:
          break;
      }
    };

    /**
     * Handle network disconnect/reconnect
     */
    this.handleNetworkDisconnect = () => {
      try {
        this.seekCleanup(); // stop scrubbing
        this.getAndSaveCurrentTime();
        this.updateViewCurrentTime();
        this.view.trigger("updateState", "paused");
        webapis.avplay.pause();
        this.analyticsManager.handleAppExit();
      } catch(e){}
    };

    this.handleNetworkReconnect = () => {
      try {
        this.view.fadeIn();
        this.updateViewCurrentTime();
        this.view.trigger("updateState", "playing");

        this.view.fadeOut(fadeTime);

        webapis.avplay.play();
      } catch(e){}
    };

    this.enterBackgroundState = () => {
      try {
        this.seekCleanup(); // stop scrubbing
        this.getAndSaveCurrentTime();
        this.stillInApp = false;
        webapis.avplay.suspend();
        this.analyticsManager.handleAppExit();
        console.log("Suspending");
      } catch(e){}
    };

    this.returnBackgroundState = () => {
      try {
        this.stillInApp = true;

        if (this.playerReady) {
          webapis.avplay.restore();
        }
        else {
          showSpinner();
          this.prepareAVPlayer();
        }
        console.log("Restoring");
      } catch(e){}
    };

    this.registerHandler("loadComplete", this.handlePlayerResp, this);
    this.registerHandler("playerError", this.handlePlayerError, this);
    this.registerHandler("buttonPress", this.handleButtonPress, this);
    this.registerHandler("updateViewTime", this.updateViewCurrentTime, this);
    this.registerHandler("show", this.show, this);
    this.registerHandler("hide", this.hide, this);
    this.registerHandler("close", this.close, this);
    this.registerHandler("networkDisconnect", this.handleNetworkDisconnect, this);
    this.registerHandler("networkReconnect", this.handleNetworkReconnect, this);
    this.registerHandler("enterBackgroundState", this.enterBackgroundState, this);
    this.registerHandler("returnBackgroundState", this.returnBackgroundState, this);
  };


  if (!exports.VideoPlayerController) { exports.VideoPlayerController = VideoPlayerController; }
})(window);
