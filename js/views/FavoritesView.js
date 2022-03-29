(function(exports){
  "use strict";

  let FavoritesView = function(){
    EventsHandler.call(this, [
      "loadComplete",
      "show",
      "hide",
      "close"
    ]);

    let _this = this;

    // MARK: - HTML ids
    const templateId = "#favorites-view-template"; // template for favorites view
    const videosTemplateId = "#favorite-videos-template"; // template for favorite videos
    const favoritesContainerId = "#favorites-container"; // div to append favorites view to
    const videosContainerClass =  " .video-favorites-container";
    const videoClass = " .video";

    const favoritesInfoClass = " .favorites-info";
    const signInBtnClass = " .sign-in-button";
    const helperMsgClass = " .helper-message";

    this.id = null;

    this.favorites = null; // array of video objects
    this.signedIn = null;  // bool

    this.index = null; // position of focuses favorite

    /**
     * Initialization
     */
    this.init = args => {
      const id = "favorites-view";
      this.id = "#" + id;

      this.setSignedIn(args.signedIn);

      const context = {
        css: {
          classes: { theme: appDefaults.theme },
          brandColor: appDefaults.brandColor,
          ids: { id: id }
        },
        labels: {
          signInButton: appDefaults.labels.signInButton,
          header: "Favorites"
        },
        images: {
          appIcon: appDefaults.appIconUrl
        }
      };

      const template = $(templateId);
      const renderedTemplate = Utils.buildTemplate(template, context);
      $(favoritesContainerId).append(renderedTemplate);

      this.setFavorites(args.favorites);
    };

    /**
     * Private methods
     */
    const showFavorites = () => $(this.id + videosContainerClass).removeClass("invisible");
    const hideFavorites = () => $(this.id + videosContainerClass).addClass("invisible");

    const showInfo = () => $(this.id + favoritesInfoClass).removeClass("invisible");
    const hideInfo = () => $(this.id + favoritesInfoClass).addClass("invisible");

    const formattedVideos = videos => {
      let formattedVids = videos.map( vid => {
        return {
          id: vid._id,
          title: vid.title,
          description: vid.description,
          duration: vid.duration || 0,
          onAir: vid.on_air,
          subscriptionRequired: vid.subscription_required,
          imgUrl: vid.thumbnails[0].url || ""
        }
      });

      return formattedVids;
    };

    const updateFavoriteVideos = videos => {
      const context = {
        videos: formattedVideos(videos),
        css: {
          classes: { theme: appDefaults.theme }
        }
      };

      let template = $(videosTemplateId);
      let renderedTemplate = Utils.buildTemplate(template, context);
      $(this.id + videosContainerClass).html(renderedTemplate);
    };

    /**
     * Update view
     */
    this.setSignedIn = signedIn => this.signedIn = signedIn;

    this.setFavorites = favs => {
      if (favs) this.favorites = favs;

      if (this.signedIn) {
        if (favs.length > 0) {
          showFavorites();
          hideInfo();
          updateFavoriteVideos(favs);

          this.setFocusedVideo(0);
        } else {
          hideFavorites();
          this.showFavoritesHelperMsg();
        }
      } else {
        hideFavorites();
        this.showSignIn();
      }
    };

    this.showSignIn = () => {
      const signInMsg = "You need to sign in see favorites";
      $(this.id + helperMsgClass).text(signInMsg);
      $(this.id + signInBtnClass).removeClass("invisible");

      showInfo();
    };

    this.showFavoritesHelperMsg = () => {
      const favsHelperMsg = "You do not have any favorites";
      $(this.id + helperMsgClass).text(favsHelperMsg);
      $(this.id + signInBtnClass).addClass("invisible");

      showInfo();
    };

    // setFocusedVideo() sets selected video index and focuses video thumbnail
    this.setFocusedVideo = index => {
      if (this.favorites[index]) {
        this.index = index;
        this.unfocusVideos();
        this.focusVideo();
        this.moveVideoContainer();
      }
    };

    // Update videos
    this.unfocusVideos = () => $(this.id + videoClass).removeClass("focused");
    this.focusVideo = () => {
      let currentVideo = $(this.id).find(videoClass)[this.index];
      $(currentVideo).addClass("focused");
    };
    this.moveVideoContainer = () => { // Note: requires this.videoIndex to be set
      let videosContainer = $(this.id + videosContainerClass)[0];

      let video = $(this.id).find(videoClass)[0];
      let videoThumbnailWidth = $(video).width();
      let videoMargin = videoThumbnailWidth * 0.10;
      let newLeft = -(this.index * (videoThumbnailWidth + videoMargin));

      $(videosContainer).animate({
        "left": String(newLeft) + "px"
      }, 200);
    };

    // MARK: - Update view state
    this.show = () => $(this.id).removeClass("invisible");
    this.hide = () => $(this.id).addClass("invisible");
    this.close = () => $(this.id).remove();

    this.registerHandler("loadComplete", this.show, this);
    this.registerHandler("show", this.show, this);
    this.registerHandler("hide", this.hide, this);
    this.registerHandler("close", this.close, this);
  };

  if (!exports.FavoritesView) { exports.FavoritesView = FavoritesView; };
})(window);
