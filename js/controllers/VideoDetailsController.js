(function(exports){
	"use strict";

	var VideoDetailsController = function(){
		EventsHandler.call(this, [
			"buttonPress",
			"action",
			"show",
			"hide",
			"close",
			"networkDisconnect",
			"networkReconnect",
			"enterBackgroundState",
			"returnBackgroundState"
		]);

		var _this = this;

		this.controllerIndex = null;

		this.content = null;
		this.videoIndex = null; // current position

		this.view = null;
		this.buttons = [];
		this.currentButtonIndex = null;

		this.consumer = null;

		// object of favorite video ids
		// key: video id
		// value: associated video favorite id
		this.favoriteIds = null;
		
		this.descriptionView = null;

	    const ViewIndexes = {
	      VIDEO_DETAIL: 0,
	      DESCRIPTION_DIALOG: 1
	    };

	    this.viewIndex = null;

		/**
		 * Callbacks
		 */
		this.createController = null; // create new controller
		this.removeSelf = null; // remove self
		

		var videoDetailsCss = function(id){
			return {
				classes: { theme: appDefaults.theme },
				ids: { id: "video-details-container-" + id }
			};
		};

		/**
		 * Initialization
		 */ 
		this.init = function(options){
			showSpinner();

			var args = options.args;
			var callbacks = options.callbacks;

			this.controllerIndex = args.controllerIndex;

			this.createController = callbacks.createController;
			this.removeSelf = callbacks.removeController;

			this.content = args.content;
			this.videoIndex = args.index;

			if (this.isSignedIn()){
				let cb = () => this.createView();
				this.fetchConsumer(localStorage.getItem("accessToken"), cb);
			} else {
				this.createView();
			}
		};

		this.updateButtons = () => {
			let videoIds = this.content.map(vid => vid._id);
			this.buttons = this.getButtons(videoIds);
			let context = {
				buttons: this.buttons,
				css: videoDetailsCss(this.content[this.videoIndex]._id)
			};

			this.currentButtonIndex = 0;

			this.view.trigger("updateButtons", context);
			this.view.focusButtonAtIndex(this.currentButtonIndex);
			this.view.unfocusDescription();
		};

		/**
		 * Update view
		 */ 
		this.show = function(){
			this.view.show();
			showSpinner();

			let cb = () => {
				this.updateButtons();
				hideSpinner();
			};

			//showSpinner();
			if (this.isSignedIn) {
				this.fetchConsumer(localStorage.getItem("accessToken"), cb);
			} else {
				cb();
			}
		};

		this.hide = function(){
			this.view.hide();
		};

		this.close = function(){
			if (this.view){
				this.view.trigger("close");
				this.view = null;
			}
		};

		/**
		 * Handle network disconnect/reconnect
		 */
		this.handleNetworkDisconnect = () => {};
		this.handleNetworkReconnect = () => {};

		this.enterBackgroundState = () => {};
		this.returnBackgroundState = () => {};

		/**
		 * Event Handlers
		 */ 
		this.createView = function(){
			let videoIds = this.content.map(vid => vid._id);
			this.buttons = this.getButtons(videoIds);
			this.currentButtonIndex = 0;

			var viewArgs = {
				css: videoDetailsCss(this.content[this.videoIndex]._id),
				data: new VideoModel(this.content[this.videoIndex]),
				buttons: this.buttons
			};

			var view = new VideoDetailsView();
			view.init(viewArgs);
			this.view = view;
			
			let dialogViewArgs = {
		        id: "controller-" + String(this.controllerIndex) + "-dialog",
		        text: new VideoModel(this.content[this.videoIndex]).description,
		        cancelText: "Okay"
	        };

	        let dialogView = new DescriptionDialogView();
	        dialogView.init(dialogViewArgs);
	        this.descriptionView = dialogView;

			this.updateButtons();

			if(exports.deepLinkedData) {
				let videoId = this.content[this.videoIndex]._id;

				let auth = {};
				if (localStorage.getItem("accessToken")) {
					auth = { access_token: localStorage.getItem("accessToken") };
				} else {
					auth = { app_key: zypeApi.appKey };
				}

				this.createController(VideoPlayerController, {
					videoIds: videoIds,
					index: this.videoIndex,
					auth: auth,
					consumer: this.consumer || {},
					videoEndCallback: this.goToNextVideo
				});

				exports.deepLinkedData = null;
			}
			else {
				hideSpinner();
			}
		};

		this.goToNextVideo = () => {
			let nextIndex = this.videoIndex + 1;
			this.videoIndex = (this.content[nextIndex]) ? nextIndex : 0;

			this.view.trigger("close");
			this.view = null;
			this.createView();
		};

		this.handleButtonPress = function(buttonPress){
			switch (buttonPress) {
				case TvKeys.UP:
					if (this.currentButtonIndex - 1 >= 0){
						this.currentButtonIndex -= 1;
						this.view.unfocusDescription();
						this.view.focusButtonAtIndex(this.currentButtonIndex);
					} else {
						this.currentButtonIndex = -1;
						this.view.focusDescription();
					}

					break;
				case TvKeys.DOWN:
					this.view.unfocusDescription();
					if (this.currentButtonIndex + 1 < this.buttons.length){
						this.currentButtonIndex += 1;
						this.view.focusButtonAtIndex(this.currentButtonIndex);
					}

					break;
				case TvKeys.ENTER:
					var buttonSelected = this.currentButton();
					if (this.currentButtonIndex !== -1) {
						this.descriptionView.trigger("hide");
						this.trigger("action", buttonSelected.role, buttonSelected.data);
					} else {
						let videoIds = this.content.map(vid => vid._id);
						if (this.viewIndex !== ViewIndexes.DESCRIPTION_DIALOG) {
							this.viewIndex = ViewIndexes.DESCRIPTION_DIALOG;
							this.descriptionView.trigger("show");
						} else {
							let exitApp = this.descriptionView.value;
							if (exitApp) {
				              // AppController exits app if no more controllers
//				              this.removeSelf();
				            } else {
				              this.descriptionView.trigger("hide");
				              this.viewIndex = ViewIndexes.VIDEO_DETAIL;
				            }
						}
					}

					break;
				case TvKeys.BACK:
				case TvKeys.RETURN:
					this.descriptionView.trigger("close");
					this.removeSelf();
					break;
				default:
					break;
			}
		};

		this.handleAction = function(action, data){
			let videoIds = data.videoIds;
			let auth = {};

			switch (action) {
				case "play":
					this.view.trigger("hide");

					if (localStorage.getItem("accessToken")) {
						auth = { access_token: localStorage.getItem("accessToken") };
					} else {
						auth = { app_key: zypeApi.appKey };
					}

					this.createController(VideoPlayerController, {
						videoIds: videoIds,
						index: this.videoIndex,
						auth: auth,
						consumer: this.consumer || {},
						videoEndCallback: this.goToNextVideo
					});
					break;

				case "oauth":
					this.view.trigger("hide");
					this.createController(OAuthController, {});
					break;

				case "resume":
					this.view.trigger("hide");

					let playbackTime = StorageManager.playbackTimes.getVideoTime(videoIds[this.videoIndex]);

					if (localStorage.getItem("accessToken")) {
						auth = { access_token: localStorage.getItem("accessToken") };
					} else {
						auth = { app_key: zypeApi.appKey };
					}

					this.createController(VideoPlayerController, {
						videoIds: videoIds,
						index: this.videoIndex,
						playbackTime: playbackTime,
						auth: auth,
						consumer: this.consumer || {},
						videoEndCallback: this.goToNextVideo
					});
					break;

				case "subscribe":
					this.view.trigger("hide");
					this.createController(PurchaseController, {video: this.content[this.videoIndex]});
					break;

				case "favorite":
					zypeApi.createConsumerVideoFavorite(this.consumer._id, data.id, localStorage.getItem("accessToken"))
					.then(
						resp => { this.trigger("show"); },
						err => { this.trigger("show"); }
					);
					break;

				case "unfavorite":
					zypeApi.deleteConsumerVideoFavorite(this.consumer._id, this.favoriteIds[data.id], localStorage.getItem("accessToken"))
					.then(
						resp => { this.trigger("show"); },
						err => { this.trigger("show"); }
					);
					break;
				case "description":
					this.view.trigger("hide");
					if (localStorage.getItem("accessToken")) {
						auth = { access_token: localStorage.getItem("accessToken") };
					} else {
						auth = { app_key: zypeApi.appKey };
					}

					this.createController(VideoPlayerController, {
						videoIds: videoIds,
						index: this.videoIndex,
						auth: auth,
						consumer: this.consumer || {},
						videoEndCallback: this.goToNextVideo
					});
					break;
				default:
					break;
			}
		};

		/**
		 * Helpers
		 */
		this.getButtons = videoIds => {
			let buttons = [];
			let requiresEntitlement = this.videoRequiresEntitlement();
			let signedIn = this.isSignedIn();
			let currentVideo = this.content[this.videoIndex];
			let videoIsFav = this.currentVideoIsFav();

			let universalSvodEnabled = appDefaults.features.universalSubscription;

			let addPlayBtns = () => {
				let playbackTime = StorageManager.playbackTimes.getVideoTime(currentVideo._id);
				let btnTitle = (playbackTime) ? appDefaults.labels.playFromBegButton : appDefaults.labels.playButton;

				let playButton = {
					title: btnTitle,
					role: "play",
					data: { videoIds: videoIds, index: this.videoIndex }
				};

				buttons.push(playButton);

				// Resume
				if (playbackTime) {
					let resumeButton = {
						title: appDefaults.labels.resumeButton,
						role: "resume",
						data: { videoIds: videoIds, index: this.videoIndex }
					};
					buttons.push(resumeButton);
				}

				// Favorite
				if (signedIn) {
					if (videoIsFav) {
						buttons.push({
							title: "Unfavorite",
							role: "unfavorite",
							data: { id: currentVideo._id }
						});
					} else {
						buttons.push({
							title: "Favorite",
							role: "favorite",
							data: { id: currentVideo._id }
						});
					}
				}
			};

			if (requiresEntitlement) {
				if (currentVideo.subscription_required && appDefaults.features.nativeSubscription) {
					if (this.consumer && this.consumer.subscription_count > 0) {
						addPlayBtns();
					} else {
						buttons.push({ title: appDefaults.labels.subscribeButton, role: "subscribe", data: {} });
					}
				} else if (!signedIn) {
					buttons.push({ title: appDefaults.labels.signInButton, role: "oauth", data: {} });
				} else {
					addPlayBtns();
				}
			} else {
				addPlayBtns();
			}

			return buttons;
		};

		this.currentButton = function(){
			return this.buttons[this.currentButtonIndex];
		};

		this.videoRequiresEntitlement = function(){
			let video = this.content[this.videoIndex];
			return (video.pass_required || video.purchase_required || video.rental_required || video.subscription_required);
		};

		this.isSignedIn = function(){
//			let accessToken = localStorage.getItem("accessToken");
//			return (accessToken) ? true : false;
			return true;
		};

		this.currentVideoIsFav = () => {
			let video = this.content[this.videoIndex];
			return (this.favoriteIds && this.favoriteIds[video._id]) ? true : false;
		};

		this.fetchConsumer = (accessToken, callback) => {
			ZypeApiHelpers.getConsumer(zypeApi, accessToken)
			.then(
				consumer => {
					this.consumer = consumer;
					this.fetchVideoFavIds(this.consumer._id, accessToken, callback);
				},
				err => { 
					callback(); 
				}
			);
		};

		this.fetchVideoFavIds = (consumerId, accessToken, callback) => {
			zypeApi.getConsumerVideoFavorites(consumerId, accessToken)
			.then(
				videoFavsResp => {
					let favoriteIds = {};
					videoFavsResp.response.forEach(vidFav => favoriteIds[vidFav.video_id] = vidFav._id);
					this.favoriteIds = favoriteIds;
					callback();
				},
				callback
			);
		};

		/**
		 * Register event handlers
		 */
		this.registerHandler("buttonPress", this.handleButtonPress, this);
		this.registerHandler("action", this.handleAction, this);
		this.registerHandler("show", this.show, this);
		this.registerHandler("hide", this.hide, this);
		this.registerHandler("close", this.close, this);
		this.registerHandler("networkDisconnect", this.handleNetworkDisconnect, this);
		this.registerHandler("networkReconnect", this.handleNetworkReconnect, this);
		this.registerHandler("enterBackgroundState", this.enterBackgroundState, this);
		this.registerHandler("returnBackgroundState", this.returnBackgroundState, this);
	};

	exports.VideoDetailsController = VideoDetailsController;
})(window);
