(function(exports){
	"use strict";

	let ConfirmDialogView = function(){
		EventsHandler.call(this, [
			"loadComplete",
			"show",
			"hide",
			"close",
			"focusConfirm",
			"focusCancel"
		]);

		let _this = this;

		// MARK: - HTML ids
		let templateId = "#confirm-dialog-view-template";
		let containerId = "#confirm-dialogs-container";

		// MARK: - Properties
		this.id = null;
		this.value = null; // Bool

		// MARK: - Initialization
		this.init = args => {
			this.id = "#" + args.id;
			this.value = false;

			let context = {
				css: {
					classes: { theme: appDefaults.theme },
					ids: { id: args.id }
				},
				text: args.text,
				confirmText: args.confirmText,
				cancelText: args.cancelText
			};

			let template = $(templateId);
			let renderedTemplate = Utils.buildTemplate(template, context);
			$(containerId).append(renderedTemplate);
		};

		this.setTrue = () => {
			this.value = true;
			$(this.id + " .dialog-cancel-button").removeClass("focused");
			$(this.id + " .dialog-confirm-button").addClass("focused");
		};

		this.setFalse = () => {
			this.value = false;
			$(this.id + " .dialog-confirm-button").removeClass("focused");
			$(this.id + " .dialog-cancel-button").addClass("focused");
		};

		// MARK: - Update view state
		this.show = () => { 
			this.setTrue();
			$(this.id).removeClass("invisible");
		};
		this.hide = () => { $(this.id).addClass("invisible"); };
		this.close = () => $(this.id).remove();

		this.registerHandler("show", this.show, this);
		this.registerHandler("hide", this.hide, this);
		this.registerHandler("close", this.close, this);
		this.registerHandler("focusConfirm", this.setTrue, this);
		this.registerHandler("focusCancel", this.setFalse, this);
	};

	if (!exports.ConfirmDialogView) { exports.ConfirmDialogView = ConfirmDialogView; };
})(window);
