(function(exports){
  "use strict";

  /**
   * Used for user credential input (signin or signup)
   */ 
    var CredentialsInputView = function(){
    EventsHandler.call(this, [
      "loadComplete" ,
      "show",
      "hide",
      "close",
      "blurInputs",
      "focusInput",
      "setInput",
      "focusConfirm",
      "unfocusConfirm",
      "highlightInput",
      "removeHighlights",
      "toggleState",
      "focusToggle",
      "unfocusToggle"
    ]);
    var _this = this;

    var templateId = "#credentials-input-view-template";
    var containerId = "#credentials-input-container";

    this.id = null;

    this.title = null;
    this.confirmButton = null;
    this.showToggle = null;
    this.toggleStateText = null;

    this.email = null;
    this.password = null;
    
    /**
     * Initialization
     */
    this.init = function(args){
      this.title = args.title;
      this.confirmButton = args.confirmButton;
      this.showToggle = args.showToggle;
      this.toggleStateText = args.toggleStateText;
      this.toggleStateHelper = args.toggleStateHelper;

      this.id = "#" + args.id;

      var context = {
        title: this.title,
        confirmButton: this.confirmButton,
        toggleStateText: this.toggleStateText,
        showToggle: this.showToggle,
        toggleStateHelper: this.toggleStateHelper,
        css: {
          classes: {
            theme: appDefaults.theme,
            brandColor: appDefaults.brandColor
          },
          ids: { id: args.id },
          positions: this.getPositionPixels()
        },
        images: {
          appIcon: appDefaults.appIconUrl
        }
      };

      var template = $(templateId);
      var renderedTemplate = Utils.buildTemplate(template, context);
      $(containerId).append(renderedTemplate);
      
      // Set dynamic color
      let selectors = [
        this.id + " .confirm-button.focused",
        this.id + ".credentials-input-view input.highlight",
      ];
      let properties = [
        { 
          "border": "solid 0.15em " + appDefaults.brandColor,
          "background-color": appDefaults.brandColor
        },
        { "border-bottom": "solid 0.1em " + appDefaults.brandColor }
      ];
      let dynamicStyle = CssHelpers.createStyles(selectors, properties);

      $(this.id).append(dynamicStyle);

      this.trigger("loadComplete");
    };


    /**
     * Helpers
     */

    // Figure out height/top pixels to set
    this.getPositionPixels = function(){
      let windowHeight = window.innerHeight;

      let appIconContainerHeight = 0.15;
      let titleContainerHeight = 0.10;
      let inputContainerHeight = 0.15;
      let confirmContainerHeight = 0.10;

      let titleContainerTop = 0.10;
      let emailContainerTop = 0.20;
      let passwordContainerTop = 0.35;
      let confirmContainerTop = 0.60;
      let toggleContainerTop = 0.70;
      let descriptionContainerTop = 0.85;

      let appIconImageTop = -0.20;
      let appIconImageLeft = -0.05;

      return {
        appIcon: {
          container: {
            height: String(windowHeight * appIconContainerHeight) + "px"
          },
          image: {
            top: String(windowHeight * appIconImageTop) + "px"
          }
        },
        title: {
          height: String(windowHeight * titleContainerHeight) + "px",
          top: String(windowHeight * titleContainerTop) + "px"
        },
        email: {
          height: String(windowHeight * inputContainerHeight) + "px",
          top: String(windowHeight * emailContainerTop) + "px"
        },
        password: {
          height: String(windowHeight * inputContainerHeight) + "px",
          top: String(windowHeight * passwordContainerTop) + "px"
        },
        confirm: {
          height: String(windowHeight * confirmContainerHeight) + "px",
          top: String(windowHeight * confirmContainerTop) + "px"
        },
        toggle: {
          top: String(windowHeight * toggleContainerTop) + "px"
        },
        description: {
          top: String(windowHeight * descriptionContainerTop) + "px"
        }
      }
    };



    // window height 1080 => 604 when keyboard shown

    // 1080 - 604 = 476

    // title.top = 5%
    // email.top = 20%
    // password.top = 35%;
    // confirm button.top = 50%
    
    // title.height = 15%
    // email.height = 10%
    // password.height = 10%;
    // confirm button.height = 10%



    /**
     * Getters
     */ 
    this.getCurrentValues = function(){
      this.email     = $(this.id + " .email-input").val();
      this.password   = $(this.id + " .password-input").val();

      return {
        email: this.email,
        password: this.password
      };
    };

    this.isInputFocused = function(){
      let inputsFocused = $(this.id).find("input:focus");
      return (inputsFocused.length > 0) ? true : false;
    };

    /**
     * Update Inputs
     */
    this.blurInputs = function(){
      $(this.id + " input").blur();
    };

    this.removeHighlights = function(){
      $(this.id + " input").removeClass("highlight");
    };

    this.highlightInput = function(inputType){
      this.removeHighlights();

      if (inputType == "email"){
        $(this.id + " input.email-input").addClass("highlight");
      } else if (inputType == "password"){
        $(this.id + " input.password-input").addClass("highlight");
      }
    };

    this.focusInput = function(inputType){
      this.blurInputs();
      this.unfocusConfirmButton();

      if (inputType == "email"){
        $(this.id + " .email-input").focus();
      } else if (inputType == "password") {
        $(this.id + " .password-input").focus();
      }
    };

    this.setInput = function(inputType, value){
      if (inputType == "email"){
        $(this.id + " input.email-input").val(value);
      } else if (inputType == "password"){
        $(this.id + " input.password-input").val(value);
      }
    };

    /**
     * Update confirmation button
     */
    this.focusConfirmButton = function(){
      this.blurInputs();
      $(this.id + " .confirm-button").addClass("focused");
    };

    this.unfocusConfirmButton = function(){
      $(this.id + " .confirm-button").removeClass("focused");
    };

    /**
     * Update text between sign in or sign up state
     */
    this.toggleState = args => {
      this.title = args.title;
      this.confirmButton = args.confirmButton;
      this.showToggle = args.showToggle;
      this.toggleStateText = args.toggleStateText;
      this.toggleStateHelper = args.toggleStateHelper;

      $(this.id + " .title").text(this.title);
      $(this.id + " .confirm-text").text(this.confirmButton);
      $(this.id + " .toggle-state-text").text(this.toggleStateText);
      $(this.id + " .toggle-state-helper").text(this.toggleStateHelper);
    };

    this.focusToggle = () => {
      $(this.id + " .toggle-state-text").addClass("focused");
    };

    this.unfocusToggle = () => {
      $(this.id + " .toggle-state-text").removeClass("focused");
    };

    /**
     * show / hide / remove self from DOM
     */ 
    this.show = function(){
      this.blurInputs();
      this.removeHighlights();
      this.unfocusConfirmButton();
      this.highlightInput("email");

      $(this.id).removeClass("invisible");
    };

    this.hide = function(){
      $(this.id).addClass("invisible");
    };

    this.close = function(){
      $(this.id).remove();
    };

    /**
     * Register event handlers
     */ 
    this.registerHandler("loadComplete", this.show, this);
    this.registerHandler("show", this.show, this);
    this.registerHandler("hide", this.hide, this);
    this.registerHandler("close", this.close, this);
    this.registerHandler("blurInputs", this.blurInputs, this);
    this.registerHandler("focusInput", this.focusInput, this);
    this.registerHandler("setInput", this.setInput, this);
    this.registerHandler("focusConfirm", this.focusConfirmButton, this);
    this.registerHandler("unfocusConfirm", this.unfocusConfirmButton, this);
    this.registerHandler("highlightInput", this.highlightInput, this);
    this.registerHandler("removeHighlights", this.removeHighlights, this);
    this.registerHandler("toggleState", this.toggleState, this);
    this.registerHandler("focusToggle", this.focusToggle, this);
    this.registerHandler("unfocusToggle", this.unfocusToggle, this);
  };

  if (!exports.CredentialsInputView) { exports.CredentialsInputView = CredentialsInputView; };
})(window);
