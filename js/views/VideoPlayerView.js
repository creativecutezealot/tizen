(function(exports){
	"use strict";

	var VideoPlayerView = function(){
		EventsHandler.call(this, ["loadComplete", "updateState", "updateTime", "show", "hide", "fadeOut", "close"]);

		let _this = this;
		let templateId = "#video-player-ui-view-template";

		this.id = null;

		this.title = null;
		this.description = null;
		this.duration = null;
		this.currentTime = null;
		this.state = null;

		this.lastFadeOutTime = null;

		let secondsToMinutesString = secs => {
			if(!secs && secs <= 0){
				return "0:00:00";
			}

			let hours = null;
			if ( secs / 3600 > 0 ){
				hours = Math.floor( secs / 3600 );
				secs -= hours * 3600;
			} else {
				hours = 0;
			}

			let mins = null;
			if ( secs / 60 > 0 ){
				mins = Math.floor( secs / 60 );
				secs -= mins * 60;
			} else {
				mins = 0;
			}

			secs = Math.floor(secs);

			let hoursString = (hours >= 10) ? String(hours) : "0" + String(hours);
			let minsString = (mins >= 10) ? String(mins) : "0" + String(mins);
			let remainderString = (secs >= 10) ? String(secs) : "0" + String(secs);

			return hoursString + ":" + minsString + ":" + remainderString;
		};

		let viewCss = id => {
			return {
				classes: {
					theme: appDefaults.theme,
					brandColor: appDefaults.brandColor
				},
				ids: { id: id }
			}
		};

		this.init = function(args){
			this.title = args.title;
			this.description = args.description;
			this.duration = args.duration;
			this.currentTime = args.currentTime;
			this.state = args.state;

			this.lastFadeOutTime = new Date().getTime() / 1000;

			let id = "video-player-ui";
			this.id = "#" + id;

			let context = {
				title: this.title,
				description: this.description,
				duration: secondsToMinutesString(this.duration),
				currentTime: secondsToMinutesString(this.currentTime),
				playPauseImage: appDefaults.pauseButtonUrl,
				css: viewCss(id)
			};

			let template = $(templateId);
			let renderedTemplate = Utils.buildTemplate(template, context);
			$("#app-container").append(renderedTemplate);
		};

		this.updateProgressBar = () => {
			let percent = (this.currentTime / this.duration) * 100;
			$(this.id + " .progress-bar").css({ width: String(percent) + "%" });
		};

		this.updateCurrentTime = () => {
			let currentTimeString = secondsToMinutesString(this.currentTime);
			$(this.id + " .current-time").text(currentTimeString);
		};

		this.updateTime = currentTime => {
			if (currentTime){ this.currentTime = currentTime; }

			this.updateProgressBar();
			this.updateCurrentTime();
		};

		this.updateDuration = time => {
			this.duration = time;
			let timeString = secondsToMinutesString(this.duration);
			$(this.id + " .duration").text(timeString);
		};

		this.updateTitle = title => {
			this.title = title;
			$(this.id + " .video-player-title").text(this.title);
		};

		this.setState = state => {
			if (state == "playing" || state == "paused"){ this.state = state; }

			if (this.state == "playing"){
				$(this.id + " .play-pause-image").attr("src", appDefaults.pauseButtonUrl);
			} else {
				$(this.id + " .play-pause-image").attr("src", appDefaults.playButtonUrl)
			}

			$(this.id + " .scrub-container").addClass("invisible");
		};

		this.setScrub = (state, speed) => {
			if (state == "ff" || state == "rw") {
				$(this.id + " .scrub-container").removeClass("invisible");

				let imageUrl = (state == "ff") ? appDefaults.fastForwardUrl : appDefaults.rewindUrl;
				$(this.id + " .ff-rw-image").attr("src", imageUrl);
				$(this.id + " .scrub-label").text(String(speed) + "x");
			}
		};

		this.show = () => $(this.id).removeClass("invisible");

		this.hide = () => $(this.id).addClass("invisible");

		this.close = () => $(this.id).remove();

		this.fadeIn = secs => {
			if (!secs){ secs = 0; }
			$(this.id).stop(true, true).fadeIn(secs * 1000);
		};

		this.fadeOut = secs => {
			if (!secs){ secs = 0; }

			let currentTimeInSecs = new Date().getTime() / 1000;

			if (this.lastFadeOutTime && (currentTimeInSecs - this.lastFadeOutTime) > secs ) {
				$(this.id).delay(secs * 1000).fadeOut();
			} else {
				// Wait and stop all animations before triggering slow fadeOut
				let callback = () => 	$(this.id).stop(true, true).delay(secs * 1000).fadeOut();
				setTimeout(callback, secs * 1000);
			}

			this.lastFadeOutTime = new Date().getTime() / 1000;
		};

		this.prepareView = () => {
			this.updateProgressBar();
			this.setState();
			this.show();
		};

		this.registerHandler("hide", this.hide, this);
		this.registerHandler("loadComplete", this.prepareView, this);
		this.registerHandler("updateTime", this.updateTime, this);
		this.registerHandler("updateState", this.setState, this);
		this.registerHandler("fadeOut", this.fadeOut, this);
		this.registerHandler("close", this.close, this);
	};

	if (!exports.VideoPlayerView) { exports.VideoPlayerView = VideoPlayerView; }
})(window);
