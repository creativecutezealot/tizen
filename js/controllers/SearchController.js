(function(exports){
  "use strict";

  let SearchController = function(){
    EventsHandler.call(this, [
      "loadComplete",
      "buttonPress",
      "show",
      "hide",
      "close",
      "networkDisconnect",
      "networkReconnect",
      "enterBackgroundState",
      "returnBackgroundState"
    ]);

    let _this = this;

    this.controllerIndex = null;

    this.view = null;
    this.viewIndex = null;

    const ViewIndex = {
      SEARCH_BAR: 0,
      VIDEOS: 1
    };

    const autoSearchInterval = 5000; // time in ms to auto search
    this.searchInterval = null; // interval to auto search
    this.lastQuery = null;

    /**
     * Callbacks
     */
    this.createController = null; // create new controller
    this.removeSelf = null; // remove self

    /**
     * Initialization
     */
    this.init = options => {
      showSpinner();

      let args = options.args;
      let callbacks = options.callbacks;

      this.controllerIndex = args.controllerIndex;

      this.createController = callbacks.createController;
      this.removeSelf = callbacks.removeController;

      let viewArgs = {};

      let view = new SearchView();
      view.init(viewArgs);
      this.view = view;
      this.trigger("loadComplete");

      this.viewIndex = ViewIndex.SEARCH_BAR;
      this.view.focusInput();

      hideSpinner();
    };

    /**
     * Autosearch Interval
     */
    this.clearSearchInterval = () => {
      clearInterval(this.searchInterval);
      this.searchInterval = null;
    };
    this.setupSearchInterval = () => {
      if (this.searchInterval) this.clearSearchInterval();
      this.searchInterval = setInterval(this.validateSearch, autoSearchInterval);
    };

    /**
     * Helpers
     */
    this.searchVideos = query => {
      this.lastQuery = query;
      ZypeApiHelpers.searchVideos(zypeApi, query, appDefaults.rootPlaylistId)
      .then(
        videos => {
          this.videos = videos;
          this.view.setVideos(videos);
          // this.viewIndex = (videos.length > 0) ? ViewIndex.VIDEOS : videoIndex.SEARCH_BAR;
          if (this.view.isInputFocused()) this.view.setFocusedVideo(this.view.videoIndex);
        },
        err => {} // ignore err for now
      );
    };

    this.validateSearch = () => { // basic validation before searching
      let query = this.view.query();
      if (query.length >=3 && query != this.lastQuery) this.searchVideos(query);
    };

    /**
     * Event Handlers
     */
    this.handleButtonPress = buttonPress => {
      switch (buttonPress) {
        case TvKeys.UP:
          this.viewIndex = ViewIndex.SEARCH_BAR;
          this.view.unfocusVideos();
          this.view.highlightInput();
          break;
        case TvKeys.DOWN:
          if (this.videos.length > 0) {
            this.viewIndex = ViewIndex.VIDEOS;
            this.view.blurInput();
            this.view.unhighlightInput();
            this.view.setFocusedVideo(this.view.videoIndex);
          }
          break;
        case TvKeys.LEFT:
          if (this.viewIndex == ViewIndex.VIDEOS) {
            this.view.setFocusedVideo(this.view.videoIndex - 1);
          }
          break;
        case TvKeys.RIGHT:
          if (this.viewIndex == ViewIndex.VIDEOS) {
            this.view.setFocusedVideo(this.view.videoIndex + 1);
          }
          break
        case TvKeys.ENTER:
          if (this.viewIndex == ViewIndex.SEARCH_BAR) {
            if (this.view.isInputFocused()) {
              this.view.blurInput();
            } else {
              this.view.focusInput();
            }

            this.validateSearch();
          } else if (this.viewIndex == ViewIndex.VIDEOS) {
            let selectedVid = this.videos[this.view.videoIndex];
            this.createController(VideoDetailsController, {content: [selectedVid], index: 0});
          }
          break;
        case TvKeys.DONE:
        case TvKeys.CANCEL:
          this.view.blurInput();
          this.validateSearch();
          break;

        case TvKeys.BACK:
        case TvKeys.RETURN:
          if (!this.view.isInputFocused()) this.removeSelf();
          break;
        default:
          break;
      }
    };

    this.show = () => {
      this.view.trigger("show");
      this.setupSearchInterval(); // auto search every N seconds
    };
    this.hide = () => {
      this.view.trigger("hide");
      this.clearSearchInterval();
    };
    this.close = () => {
      this.clearSearchInterval();
      this.view.close();
      this.view = null;
    };

    /**
     * Handle network disconnect/reconnect
     */
    this.handleNetworkDisconnect = () => {};
    this.handleNetworkReconnect = () => {};

    this.enterBackgroundState = () => {};
    this.returnBackgroundState = () => {};

    this.registerHandler("loadComplete", this.show, this);
    this.registerHandler("buttonPress", this.handleButtonPress, this);
    this.registerHandler("show", this.show, this);
    this.registerHandler("hide", this.hide, this);
    this.registerHandler("close", this.close, this);
    this.registerHandler("networkDisconnect", this.handleNetworkDisconnect, this);
    this.registerHandler("networkReconnect", this.handleNetworkReconnect, this);
    this.registerHandler("enterBackgroundState", this.enterBackgroundState, this);
    this.registerHandler("returnBackgroundState", this.returnBackgroundState, this);
  };

if (!exports.SearchController) { exports.SearchController = SearchController; };
})(window);
