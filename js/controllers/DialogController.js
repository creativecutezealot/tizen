(function(exports){
    "use strict";

    var DialogController = function(){
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

		var _this = this;

		this.controllerIndex = null;

		this.view = null;

		/**
		 * Callbacks
		 */
		this.createController = null; // create new controller
		this.removeSelf = null; // remove self

		this.init = function(options){
			showSpinner();

			var args = options.args;
			var callbacks = options.callbacks;

			this.createController = callbacks.createController;
			this.removeSelf = callbacks.removeController;

			this.controllerIndex = args.controllerIndex;

			var viewArgs = {
				title: args.title,
				message: args.message
			};

			var view = new DialogView();
			view.init(viewArgs);
			this.view = view;
			this.trigger("loadComplete");

			hideSpinner();
		};

		this.handleButtonPress = function(buttonPress){
			switch (buttonPress) {
				case TvKeys.LEFT:
				case TvKeys.RIGHT:
				case TvKeys.UP:
				case TvKeys.DOWN:
					break;
			
				case TvKeys.ENTER:
					this.removeSelf();
					break;
				case TvKeys.RETURN:
				case TvKeys.BACK:
					this.removeSelf();
					break;
				default:
					break;
			}
		};

		this.show = function(){
			this.view.trigger("show");
		};

		this.hide = function(){
			this.view.trigger("hide");
		};

		this.close = function(){
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

	if (!exports.DialogController) { exports.DialogController = DialogController; };
})(window);
