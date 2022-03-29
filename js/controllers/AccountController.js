(function(exports){
	"use strict";

	let AccountController = function(){
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
		this.buttons = [];
		this.buttonIndex = null;

		/**
		 * Callbacks
		 */
		this.createController = null; // create new controller
		this.removeSelf = null; // remove self

		this.init = options => {
			showSpinner();

			let args = options.args;
			let callbacks = options.callbacks;

			this.controllerIndex = args.controllerIndex;

			this.createController = callbacks.createController;
			this.removeSelf = callbacks.removeController;

			let viewArgs = {};

			let view = new AccountView();
			view.init(viewArgs);
			this.view = view;
			this.trigger("loadComplete");

			hideSpinner();
		};

		this.handleButtonPress = buttonPress => {
			switch (buttonPress) {
				case TvKeys.UP:
					let canMoveUp = (this.buttonIndex > 0);

					if (canMoveUp) {
						this.buttonIndex -= 1;
						this.view.trigger("focusButton", this.buttonIndex);
					}

					break;
				case TvKeys.DOWN:
					let canMoveDown = (this.buttonIndex < this.buttons.length - 1);

					if (canMoveDown) {
						this.buttonIndex += 1;
						this.view.trigger("focusButton", this.buttonIndex);
					}

					break;

				case TvKeys.LEFT:
				case TvKeys.RIGHT:
					break
				case TvKeys.ENTER:
					let currentButton = this.buttons[ this.buttonIndex ];

					if (currentButton.role == "sign-in") {
						this.createController(OAuthController, {});
					} else if (currentButton.role == "sign-out") {
						localStorage.removeItem("accessToken");
						localStorage.removeItem("refreshToken");
						localStorage.removeItem("email");
						localStorage.removeItem("password");

						this.trigger("show");
						setTimeout(() => alert("Signed out"), 250);
					}

					break;
				case TvKeys.BACK:
				case TvKeys.RETURN:
					this.removeSelf();
					break;
				default:
					break;
			}
		};

		// MARK: - Helper Methods
		this.getButtons = () => {
			let signedIn = localStorage.getItem("accessToken");

			if (signedIn) {
				return [ { index: 0, title: "Sign Out", role: "sign-out" } ];
			} else {
				return [ { index: 0, title: "Sign In", role: "sign-in" } ];
			}
		};

		this.show = () => {
			this.buttons = this.getButtons();
			this.buttonIndex = 0;

			this.view.trigger("show", this.buttons);
			this.view.trigger("focusButton", 0);
		};

		this.hide = () => {
			this.view.trigger("hide");
		};

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
		this.registerHandler("networkDisconnect", this.handleNetworkDisconnect, this);
		this.registerHandler("networkReconnect", this.handleNetworkReconnect, this);
		this.registerHandler("enterBackgroundState", this.enterBackgroundState, this);
		this.registerHandler("returnBackgroundState", this.returnBackgroundState, this);
	};

if (!exports.AccountController) { exports.AccountController = AccountController; };
})(window);
