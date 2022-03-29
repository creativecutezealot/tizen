(function(exports){
  "use strict";

  var OAuthController = function(){
    EventsHandler.call(this, [
      "loadComplete",
      "buttonPress",
      "show",
      "hide",
      "close",
      "signIn",
      "signUp",
      "toggleState",
      "networkDisconnect",
      "networkReconnect",
      "enterBackgroundState",
      "returnBackgroundState"
    ]);

    let _this = this;

    const ControllerState = {
      SIGN_IN: 0,
      SIGN_UP: 1
    };
    
    /**
     * Set as 0-3
     *   0: Email input
     *   1: Password input
     *   2: Confirmation button
     *   3: Link to sign up/in (only show if using Marketplace Connect)
     */
    this.currentIndex = null;
    this.currentState = null;

    this.controllerIndex = null;

    this.view = null;

    /**
     * Callbacks
     */
    this.createController = null; // create new controller
    this.removeSelf = null; // remove self

    /**
     * Initialization
     * 
     * options = {
     *   args: {
     *     controllerIndex: an integer to keep track,
     *     isSignUp: a boolean for whether to start as sign up
     *   },
     *   callbacks: {
     *     createController: callback for creating next controller,
     *     removeSelf: callback for removing self and returning to prev controller
     *   }
     * }
     */
    this.init = options => {
      showSpinner();

      let args = options.args;
      let callbacks = options.callbacks;

      this.controllerIndex = args.controllerIndex;

      this.createController = callbacks.createController;
      this.removeSelf = callbacks.removeController;

      if (args.isSignUp) {
        this.currentState = ControllerState.SIGN_UP;
      } else {
        this.currentState = ControllerState.SIGN_IN;
      }

      let viewArgs = this.viewArgs(args.isSignUp);

      let view = new CredentialsInputView();
      view.init(viewArgs);
      this.view = view;

      this.currentIndex = 0;

      hideSpinner();
    };

    this.viewArgs = isSignUp => {
      // Note: may need to update this if more native monetizations are supported
      let showToggle = appDefaults.features.nativeSubscription;

      let signUpArgs = {
        title: "Sign up to create an account",
        confirmButton: "CREATE ACCOUNT",
        id: "auth-view",
        toggleStateText: "Sign in",
        toggleStateHelper: "Already have an account?",
        showToggle: showToggle
      };
      let signInArgs = {
        title: "Sign in to your account",
        confirmButton: "SIGN IN",
        id: "auth-view",
        toggleStateText: "Sign up",
        toggleStateHelper: "Don't have an account?",
        showToggle: showToggle
      };

      return isSignUp ? signUpArgs : signInArgs;
    };

    /**
     * Handle user input 
     */
    this.handleButtonPress = buttonPress => {
      switch (buttonPress) {
        case TvKeys.DOWN:
          // if user not updating input, handle down
          if (this.view.isInputFocused() == false){ this.handleDown(); }
          break;
        case TvKeys.UP:
          // if user not updating input, handle up
          if (this.view.isInputFocused() == false){ this.handleUp(); }
          break;
        case TvKeys.ENTER:
          // if not inputting
          this.handleEnter();
          break;
        case TvKeys.RETURN:
          if (this.view.isInputFocused()) {
            this.view.trigger("blurInputs");
          } else {
            this.removeSelf();
          }
          break;

        case TvKeys.BACK:

          if (this.view.isInputFocused()){
            // do nothing. let native keyboard delete character
          } else {
            this.removeSelf();
          }
          break;

        // Keyboard
        case TvKeys.DONE:
        case TvKeys.CANCEL:
          this.view.trigger("blurInputs");
          break;
        default:
          break;
      }
    };

    this.handleDown = () => {
      switch(this.currentIndex) {
        case 0:
          this.currentIndex += 1;
          this.view.trigger("highlightInput", "password");
          break;
        case 1:
          this.currentIndex += 1;
          this.view.trigger("removeHighlights");
          this.view.trigger("focusConfirm");
          break;
        case 2:
          if (this.view.showToggle) {
            this.currentIndex += 1;
            this.view.trigger("unfocusConfirm");
            this.view.trigger("focusToggle");
          }
          break;
        default:
          break;
      }
    };

    this.handleUp = () => {
      switch(this.currentIndex) {
        case 1:
          this.currentIndex -= 1;
          this.view.trigger("highlightInput", "email");
          break;
        case 2:
          this.currentIndex -= 1;
          this.view.trigger("unfocusConfirm");
          this.view.trigger("highlightInput", "password");
          break;
        case 3:
          this.currentIndex -= 1;
          this.view.trigger("unfocusToggle");
          this.view.trigger("focusConfirm");
        default:
          break;
      }
    };

    this.handleEnter = () =>{
      switch (this.currentIndex) {
        case 0:
          this.view.trigger("focusInput", "email");
          break;
        case 1:
          this.view.trigger("focusInput", "password");
          break;
        case 2:
          var credentials = this.view.getCurrentValues();
          if (this.currentState == ControllerState.SIGN_UP) {
            this.trigger("signUp", credentials);
          } else {
            this.trigger("signIn", credentials);
          }
          break;
        case 3:
          let viewArgs = null;
          if (this.currentState == ControllerState.SIGN_IN) { // set to sign up
            this.currentState = ControllerState.SIGN_UP;
            viewArgs = this.viewArgs(true);
          } else { // set to sign in
            this.currentState = ControllerState.SIGN_IN;
            viewArgs = this.viewArgs(false);
          }
          this.view.toggleState(viewArgs);
          break;
        default:
          break;
      }
    };

    /**
     * Handle Sign In/Up
     */
    this.signIn = credentials => {
      let errMsg = this.validateCredenitals(credentials);
      if (errMsg) {
        alert(errMsg);
      } else {
        zypeApi.createLoginAccessToken(credentials.email, credentials.password)
        .then(
          resp => {
            _this.saveUser(resp, credentials);
            _this.removeSelf();
          },
          err => { alert("Cannot find user") }
        );
      }
    };

    this.signUp = credentials => {
      let errMsg = this.validateCredenitals(credentials);
      if (errMsg) {
        alert(errMsg);
      } else {
        let params = {
          "consumer[email]": credentials.email, 
          "consumer[password]": credentials.password
        };
        zypeApi.createConsumer(params).then(
          resp => {
            _this.signIn({email: credentials.email, password: credentials.password});
          },
          err => {
            alert("Could not create account");
          }
        );
      }
    };

    this.validateCredenitals = credentials => {
      let errorMsg;

      if (credentials.email.length == 0){
        errorMsg = "Email is empty";
      } else if (credentials.password.length == 0){
        errorMsg = "Password is empty";
      }

      return errorMsg;
    };

    this.saveUser = (tokenResp, credentials) => {
      localStorage.setItem("accessToken", tokenResp.access_token);
      localStorage.setItem("refreshToken", tokenResp.refresh_token);
      localStorage.setItem("email", credentials.email);
      localStorage.setItem("password", credentials.password);
    };

    /**
     * show / hide / close self
     */
    this.show = () => this.view.trigger("show");
    this.hide = () => this.view.trigger("hide");
    this.close = () => {
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
    this.registerHandler("signIn", this.signIn, this);
    this.registerHandler("signUp", this.signUp, this);
    this.registerHandler("toggleState", this.toggleState, this);
    this.registerHandler("networkDisconnect", this.handleNetworkDisconnect, this);
    this.registerHandler("networkReconnect", this.handleNetworkReconnect, this);
    this.registerHandler("enterBackgroundState", this.enterBackgroundState, this);
    this.registerHandler("returnBackgroundState", this.returnBackgroundState, this);
  };

  if (!exports.OAuthController) { exports.OAuthController = OAuthController; };
})(window);
