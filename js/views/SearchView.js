(function(exports){
  "use strict";

  let SearchView = function(){
    EventsHandler.call(this, [
      "loadComplete",
      "show",
      "hide",
      "close",
      "focusButton"
    ]);

    let _this = this;

    this.videos = [];
    this.videoIndex = null; // integer

    // MARK: - Dynamic CSS
    const templateId = "#search-view-template";
    const videosTemplateId = "#search-videos-template";
    const searchContainerId = "#search-container";
    const queryInputClass = " .query-input";
    const videosContainerClass =  " .videos-container";
    const videoClass = " .video";
    const videoTitleClass = " .video-title";
    const videoResultsClass = " .video-results";

    // need pixels instead of % for position bc window size changes when keyboard appears
    const queryContainerTop = window.innerHeight * 0.05;
    const queryContainerHeight = window.innerHeight * 0.10;
    const videoContainerTop = window.innerHeight * 0.20;
    const videoContainerWidth = window.innerWidth * 0.20;
    const videoContainerHeight = window.innerHeight * 0.20;
    const videoResultsContainerTop = window.innerHeight * 0.45;
    const videoResultsContainerLeft = window.innerWidth * 0.45;

    this.id = null;

    /**
     * Initialization
     */
    this.init = args => {
      const id = "search-view";
      this.id = "#" + id;

      let context = {
        css: {
          classes: {
            theme: appDefaults.theme
          },
          brandColor: appDefaults.brandColor,
          ids: { id: id },
          positions: {
            queryContainer: {
              top: String(queryContainerTop) + "px",
              height: String(queryContainerHeight) + "px"
            },
            videoContainer: {
              top: String(videoContainerTop) + "px",
              width: String(videoContainerWidth) + "px",
              height: String(videoContainerHeight) + "px"
            },
            videoResultsContainer: {
              top: String(videoResultsContainerTop) + "px",
              left: String(videoResultsContainerLeft) + "px",
            }
          }
        },
        appIconUrl: appDefaults.appIconUrl
      };

      let template = $(templateId);
      let renderedTemplate = Utils.buildTemplate(template, context);
      $(searchContainerId).append(renderedTemplate);

      this.highlightInput();

      this.trigger("loadComplete");
    };

    /**
     * Update View
     */

    // Update inputs
    this.blurInput = () => $(this.id + queryInputClass).blur();
    this.focusInput = () => $(this.id + queryInputClass).focus();
    this.highlightInput = () => $(this.id + queryInputClass).addClass("highlight");
    this.unhighlightInput = () => $(this.id + queryInputClass).removeClass("highlight");

    // Update videos
    this.unfocusVideos = () => $(this.id + videoClass).removeClass("focused");
    this.focusVideo = () => {
      let currentVideo = $(this.id).find(videoClass)[this.videoIndex];
      $(currentVideo).addClass("focused");
    };
    this.moveVideoContainer = () => { // Note: requires this.videoIndex to be set
      let videosContainer = $(this.id + videosContainerClass)[0];

      let video = $(this.id).find(videoClass)[0];
      let videoThumbnailWidth = $(video).width();
      let videoMargin = videoThumbnailWidth * 0.10;
      let newLeft = -(this.videoIndex * (videoThumbnailWidth + videoMargin));

      $(videosContainer).animate({
        "left": String(newLeft) + "px"
      }, 200);
    };

    this.updateVideoResult = () => {
      let text = (this.videos.length > 0) ? "" : "No results found";
      $(this.id + videoResultsClass).text(text);
    };

    // setFocusedVideo() sets selected video index and focuses video thumbnail
    this.setFocusedVideo = index => {
      if (this.videos[index]) {
        this.videoIndex = index;
        if (!this.isInputFocused()) { // only focus videos if user is not still typing
          this.unhighlightInput();
          this.blurInput();
          this.unfocusVideos();
          this.focusVideo();
        }
        this.moveVideoContainer();
      }
      this.updateVideoResult();
    };

    // setVideos() updates the videos in view and focuses first
    this.setVideos = videos => {
      this.videos = videos;

      let context = {
        videos: this.formattedVideos(videos),
        css: {
          classes: { theme: appDefaults.theme }
        }
      };

      let template = $(videosTemplateId);
      let renderedTemplate = Utils.buildTemplate(template, context);
      $(this.id + videosContainerClass).html(renderedTemplate);

      this.videoIndex = 0;
    };

    /**
     * Getters
     */
    this.isInputFocused = () => {
      let inputsFocused = $(this.id).find("input:focus");
      return (inputsFocused.length > 0) ? true : false;
    };

    this.query = () => {
      let input = $(this.id).find(".query-input")[0];
      return $(input).val();
    };

    /**
     * Helpers
     */
    this.formattedVideos = videos => {
      let formattedVids = [];

      for (let i = 0; i < videos.length; i++) {
        const vid = videos[i];

        // Note: add more fields as needed
        const formattedVid = {
          id: vid._id,
          title: vid.title,
          description: vid.description,
          duration: vid.duration || 0,
          onAir: vid.on_air,
          subscriptionRequired: vid.subscription_required,
          imgUrl: vid.thumbnails[0].url || ""
        };

        formattedVids.push(formattedVid);
      }

      return formattedVids;
    };

    // MARK: - Update view state
    this.show = () => $(this.id).removeClass("invisible");
    this.hide = () => $(this.id).addClass("invisible");
    this.close = () => $(this.id).remove();

    this.registerHandler("loadComplete", this.show, this);
    this.registerHandler("show", this.show, this);
    this.registerHandler("hide", this.hide, this);
    this.registerHandler("close", this.close, this);
    this.registerHandler("focusButton", this.focusButtonAt, this);
  };

  if (!exports.SearchView) { exports.SearchView = SearchView; };
})(window);
