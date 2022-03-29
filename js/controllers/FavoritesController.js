(function(exports){
  "use strict";

  let FavoritesController = function(){
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

    let controllerIndex = null;
    let consumerId = null;

    this.view = null;
    this.viewIndex = null;
    const ViewIndex = {
      SIGN_IN: 0,
      VIDEOS: 1
    };

    /**
     * Callbacks
     */
    let createController = null; // create new controller
    let removeSelf = null; // remove self

    this.init = options => {
      showSpinner();

      const args = options.args;
      const callbacks = options.callbacks;

      controllerIndex = args.controllerIndex;

      createController = callbacks.createController;
      removeSelf = callbacks.removeController;

      this.trigger("show");
    };

    this.createView = () => {
      let viewArgs = {
        signedIn: this.isSignedIn(),
        favorites: this.favorites,
      };

      let view = new FavoritesView();
      view.init(viewArgs);
      this.view = view;
      this.view.trigger("show");

      hideSpinner();
    };

    this.isSignedIn = () => {
      // TODO: add logic to determine if sign in is needed (favorites via api)
      let accessToken = localStorage.getItem("accessToken");
//      return (accessToken) ? true : false;
      return true ;
    };

    this.fetchFavorites = callback => {
      // TODO: add logic for getting favorites from local storage vs api

      let emptyFavsCallback = () => {
        this.favorites = [];
        callback();
      };

      if (this.isSignedIn()) {
    	  var favorites = JSON.parse(localStorage.getItem("myFavorites"));
    	  
    	  if(favorites === null){
    		  emptyFavsCallback()
    	  }
    	  if (favorites.length > 0) {
            this.viewIndex = ViewIndex.VIDEOS;
            this.favorites = favorites;
            callback();
          } else {
            emptyFavsCallback();
          }
//        let accessToken = localStorage.getItem("accessToken");
//        ZypeApiHelpers.getConsumerFavorites(zypeApi, accessToken).then(
//          favorites => {
//            if (favorites.length > 0) {
//              this.viewIndex = ViewIndex.VIDEOS;
//              this.favorites = favorites;
//              callback();
//            } else {
//              emptyFavsCallback();
//            }
//          },
//          err => { emptyFavsCallback(); }
//        );
      } else {
        this.viewIndex = ViewIndex.SIGN_IN;
        emptyFavsCallback();
      }
    };

    /**
     * Event Handlers
     */
    this.handleButtonPress = buttonPress => {
      switch (buttonPress) {
        case TvKeys.UP:
        case TvKeys.DOWN:
          break;

        case TvKeys.LEFT:
          if (this.viewIndex == ViewIndex.VIDEOS) {
            let nextIndex = this.view.index - 1;
            let nextVideo = this.view.favorites[nextIndex];

            if (nextVideo) {
              this.view.setFocusedVideo(nextIndex);
            } else {
              this.view.setFocusedVideo(this.view.favorites.length - 1);
            }

            this.view.moveVideoContainer();
          }
          break;

        case TvKeys.RIGHT:
          if (this.viewIndex == ViewIndex.VIDEOS) {
            let nextIndex = this.view.index + 1;
            let nextVideo = this.view.favorites[nextIndex];

            if (nextVideo) {
              this.view.setFocusedVideo(nextIndex);
            } else {
              this.view.setFocusedVideo(0);
            }

            this.view.moveVideoContainer();
          }
          break;

        case TvKeys.ENTER:
          if (this.viewIndex == ViewIndex.SIGN_IN) {
            createController(OAuthController, {});
          } else if (this.viewIndex == ViewIndex.VIDEOS) {
            createController(VideoDetailsController, {content: this.favorites, index: this.view.index});
          }
          break;
        case TvKeys.BACK:
        case TvKeys.RETURN:
          removeSelf();
          break;
        default:
          break;
      }
    };

    this.show = () => {
      showSpinner();
      if (this.view) {
        this.view.close();
        this.view = null;
      }
      this.fetchFavorites(this.createView);
    };
    this.hide = () => this.view.trigger("hide");

    this.close = () => {
      if (this.view) {
        this.view.close();
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

  if (!exports.FavoritesController) { exports.FavoritesController = FavoritesController; };
})(window);
