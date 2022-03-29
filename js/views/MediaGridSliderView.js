(function(exports) {
  "use strict";

  // Similar to MediaGridView except with sliders in place of display
  let MediaGridSliderView = function() {
    EventsHandler.call(this, [
      "loadComplete",
      "show",
      "hide",
      "close"
    ]);

    let _this = this;

    // MARK: - HTML ids
    let templateId = "#media-grid-slider-view-template";
    let mediaGridContainerId = "#media-grid-slider-container";
    const rowLeftMargin = "7.5%";

    // MARK: - Properties
    this.id = null;
    this.currentPosition = []; // 1-dim array of 2 indexes (row, column)
    this.currentRowsTopPosition = null;
    this.rowsLeftPositions = []; // 1-dim array of row positions
    this.sliderIndex = null; // integer

    this.mediaContent = null; // 1-dim array of row content
    this.sliders = null; // 1-dim array of sliders

    // Initialization
    this.init = args => {
      this.mediaContent = args.mediaContent;
      this.sliders = args.sliders;
      this.currentPosition = [0, 0];
      this.currentRowsTopPosition = 0;

      for (let i = 0; i < this.mediaContent.length; i++) {
        this.rowsLeftPositions.push(0);
      }

      this.id = "#" + args.css.ids.id;

      let context = {
        showThumbnailTitles: appDefaults.features.showThumbnailTitles,
        rowData: this.mediaContent,
        sliders: this.sliderInfo(this.sliders),
        css: args.css
      };

      let template = $(templateId);
      let renderedTemplate = Utils.buildTemplate(template, context);
      $(mediaGridContainerId).append(renderedTemplate);

      // Set dynamic color
      let selector = ".media-grid-thumbnail.focused-thumbnail, .slider .slider-img.focused-slider";
      let properties = { "border": "solid 0.5em " + appDefaults.brandColor };
      let dynamicStyle = CssHelpers.createStyle(selector, properties);

      $(this.id).append(dynamicStyle);

      this.trigger("loadComplete");
    };

    // MARK: - Private Helpers
    this.rowIndex = () => this.currentPosition[0];
    this.colIndex = () => this.currentPosition[1];
    this.rowHeightAtIndex = index => {
      let row = $(this.id + " .media-grid-row")[index];
      return $(row).height();
    }

    this.sliderInfo = sliders => {
      let info = [];

      for (let i = 0; i < sliders.length; i++) {
        let imgUrl = "";
        if (sliders[i].pictures.length > 0) imgUrl = sliders[i].pictures[0].url;

        info.push({
          videoId: sliders[i].videoid,
          playlistId: sliders[i].playlistid,
          imgUrl: imgUrl
        });
      }

      return info;
    };

    this.focusedContent = () => {
      if (!this.mediaContent)  return null;
      return this.mediaContent[this.rowIndex()].content[this.colIndex()];
    };

    // focusThumbnail() sets focus on thumbnail based on current position
    this.focusThumbnail = () => {
      let currentRow = $(this.id + " .media-grid-row")[this.rowIndex()];
      let currentThumbnail = $(currentRow).find(".media-grid-thumbnail")[this.colIndex()];
      $(currentThumbnail).addClass("focused-thumbnail");
    };

    this.prepareView = () => {
      this.show();
    };

    // MARK: - Public Methods

    /**
     * setNewPosition() sets the new position
     * @param {Integer[]} position - int array of 2 values (row index, col index)
     */
    this.setNewPosition = position => {
      this.currentPosition = position;
    };

    // unfocusThumbnails() removes focus class from all thumbnails
    this.unfocusThumbnails = () => {
      $(this.id + " .media-grid-thumbnail").removeClass("focused-thumbnail");
    };

    /**
     * resetRowMargin() resets the left margin of row
     * @param {*} rowIndex - index of row to be reset
     */
    this.resetRowMarginAt = rowIndex => {
      let row = $(this.id + " .media-grid-row .media-grid-row-thumbnails")[rowIndex];
      $(row).css({ "margin-left": rowLeftMargin });
    };

    // shiftRowsUp() moves all rows up
    this.shiftRowsUp = () => {
      let currentRowHeight = this.rowHeightAtIndex(this.rowIndex());

      let newTopPosition = this.currentRowsTopPosition - currentRowHeight;
      this.currentRowsTopPosition = newTopPosition;
      $(this.id + " .media-grid-rows-container").css({top: String(this.currentRowsTopPosition) + "px"});

      this.hideRowsAboveLimit();
    };

    // shiftRowsDown() moves all rows down
    this.shiftRowsDown = () => {
      let nextRowHeight = this.rowHeightAtIndex(this.rowIndex() - 1);
      let newTopPosition = this.currentRowsTopPosition + nextRowHeight;

      this.currentRowsTopPosition = newTopPosition;
      $(this.id + " .media-grid-rows-container").css({top: String(this.currentRowsTopPosition) + "px"});

      this.hideRowsAboveLimit();
    };

    /**
     * shiftRowLeftAt() moves a row to the left
     * @param {Integer} index - row index of row to be shifted left
     */
    this.shiftRowLeftAt = index => {
      let row = $(this.id + " .media-grid-row .media-grid-row-thumbnails")[index];
      let thumbnail = $(row).find(".media-grid-thumbnail")[0];
      let shiftPercentage = (1.1125 * $(thumbnail).width() / $(window).width()) * 100;

      let newLeftPosition = this.rowsLeftPositions[index] - shiftPercentage;
      this.rowsLeftPositions[index] = newLeftPosition;
      $(row).css({"margin-left": String(newLeftPosition) + "%"});
    };

    /**
     * shiftRowRightAt() moves a row to the right
     * @param {Integer} index - row index of row to be shifted right
     */
    this.shiftRowRightAt = index => {
      let row = $(this.id + " .media-grid-row .media-grid-row-thumbnails")[index];
      let thumbnail = $(row).find(".media-grid-thumbnail")[0];
      let shiftPercentage = (1.1125 * $(thumbnail).width() / $(window).width()) * 100;

      let newLeftPosition = this.rowsLeftPositions[index] + shiftPercentage;
      this.rowsLeftPositions[index] = newLeftPosition;
      $(row).css({"margin-left": String(newLeftPosition) + "%"});
    };

    /**
     * focusedThumbTouchesEdge() returns boolean
     * checks if focused thumbnail too close to left/right of client window
     * @return {Bool}
     */
    this.focusedThumbTouchesEdge = () => {
      let focusedThumbnail = $(this.id + " .focused-thumbnail")[0];

      let thumbnailInfo = {
        height: $(focusedThumbnail).height(),
        width: $(focusedThumbnail).width(),
        top: $(focusedThumbnail).position().top,
        left: $(focusedThumbnail).position().left
      };

      let htmlWidth = document.documentElement.clientWidth;

      let thumbnailRight = thumbnailInfo.left + (1.25 * thumbnailInfo.width);

      let touchesLeft = (thumbnailInfo.left <= 0 || thumbnailRight <= 0);
      let touchesRight = (thumbnailInfo.left >= htmlWidth || thumbnailRight >= htmlWidth);

      return (touchesLeft || touchesRight);
    };

    /**
     * Sliders
     */
    this.unfocusSliders = () => {
      $(this.id + " .slider-img").removeClass("focused-slider");
    };

    // focusSlider() sets css class to focus slider
    // - requires this.sliderIndex to be set
    this.focusSlider = () => {
      let currentSlider = $(this.id).find(".slider-img")[this.sliderIndex];
      $(currentSlider).addClass("focused-slider");
    };

    // moveSliderContainer() sets position of slider container
    // - requires this.sliderIndex to be set
    this.moveSliderContainer = () => {
      // should only have one .slider-container div
      let sliderContainer = $(this.id + " .sliders-container")[0];

      let slider = $(this.id).find(".slider")[0];
      let sliderWidth = $(slider).width();
      let sliderMargin = sliderWidth * 0.025;
      let newLeft = -(this.sliderIndex * (sliderWidth + sliderMargin) );

      $(sliderContainer).css("position", "relative").animate({
        "left": String(newLeft) + "px"
      }, 500);
    };

    // sets and focuses a specific slider
    this.setFocusedSlider = index => {
      this.setAndMoveSlider(index);
      this.focusSlider();
    };

    // set and moves to specfic slider
    this.setAndMoveSlider = index => {
      if (this.sliders[index]) {
        this.sliderIndex = index;
        this.unfocusSliders();
        this.moveSliderContainer();
      }
    };

    /**
     * Update DOM
     */ 
    this.setFocus = () => {
      this.unfocusThumbnails();
      this.focusThumbnail();
    };

    this.hideRowsAboveLimit = () => {
      $(this.id + " .media-grid-row").each( (index, value) => {
        let row = $(value);
        if (row.hasClass("invisible")){
          $(value).removeClass("invisible");
        }

        if ($(value).position().top < 0){
          $(value).addClass("invisible");
        }
      });
    };

    /**
     * show / hide / close self
     */ 
    this.show = () => $(this.id).removeClass("invisible");
    this.hide = () => $(this.id).addClass("invisible");
    this.close = () => $(this.id).remove();


    /**
     * Register event handlers
     */ 
    this.registerHandler("show", this.show, this);
    this.registerHandler("hide", this.hide, this);
    this.registerHandler("close", this.close, this);
    this.registerHandler("loadComplete", this.prepareView, this);
  };

  if (!exports.MediaGridSliderView) exports.MediaGridSliderView = MediaGridSliderView;
})(window);
