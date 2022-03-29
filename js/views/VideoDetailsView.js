(function(exports){
	"use strict";

	var VideoDetailsView = function(){
		EventsHandler.call(this, [
			"loadComplete",
			"show",
			"hide",
			"close",
			"updateButtons"
		]);

		let templateId = "#video-details-view-template";
		let buttonsTemplateId = "#buttons-view-template";
		let videoDetailsContainerId = "#video-details-container";

		this.id = null;	// id of view once attached to DOM
		this.buttons = [];
		this.data = null;

		this.init = (args) => {
			this.data = args.data;
			this.buttons = args.buttons;
			for (let i = 0; i < this.buttons.length; i++) {
				this.buttons[i].id = "video-details-button-" + String(this.data.id) + "-" + String(i);
			}

			// set id for manipulating DOM
			this.id = "#" + args.css.ids.id;

			let context = {
				data: this.data,
				buttons: this.buttons,
				css: args.css,
				images: {
					appIcon: appDefaults.appIconUrl,
					overlay: (appDefaults.theme == "dark-theme" ? "overlay.png" : "whiteoverlay.png")
				}
			};

			let template = $(templateId);
			let renderedTemplate = Utils.buildTemplate(template, context);
			$(videoDetailsContainerId).append(renderedTemplate);

			// Set dynamic color
			let selector = ".video-details-buttons-container .button.focused";
			let properties = { "border": "solid 0.5em " + appDefaults.brandColor };
			let dynamicStyle = CssHelpers.createStyle(selector, properties);

			$(this.id).append(dynamicStyle);

			this.trigger("loadComplete");
		};

		this.focusButtonAtIndex = (index) => {
			$(this.id + " .button.focused").removeClass("focused");

			let button = $(this.id + " .button")[index];
			$(button).addClass("focused");
		};
		
		this.unfocusDescription = () => {
			$(this.id + " .video-details-description.focused").removeClass("focused");
		};
		
		this.focusDescription = () => {
			$(this.id + " .button.focused").removeClass("focused");
			let description = $(this.id + " .video-details-description");
			$(description).addClass("focused");
		};

		this.setText = () => {
			$(this.id + " .video-details-title").text(this.data.title);
			$(this.id + " .video-details-description").text(this.data.description);
		};

		this.setThumbnail = () => {
			let largeThumbnail = $(this.id + " .large-thumbnail");
			largeThumbnail.attr("src", this.data.largeThumbnailUrl);
		};

		this.prepareView = () => {
			this.setText();
			this.setThumbnail();
			this.show();
		};

		this.show = () => $(this.id).removeClass("invisible");

		this.hide = () => $(this.id).addClass("invisible");

		this.close = () => $(this.id).remove();

		this.updateButtons = args => {
			this.buttons = args.buttons;
			for (let i = 0; i < this.buttons.length; i++) {
				this.buttons[i].id = "video-details-button-" + String(this.data.id) + "-" + String(i);
			}

			let context = { buttons: this.buttons, css: args.css };
			let template = $(buttonsTemplateId);
			let renderedTemplate = Utils.buildTemplate(template, context);

			$(this.id + " .video-details-buttons-container").html(renderedTemplate);
		};

		this.registerHandler("loadComplete", this.prepareView, this);
		this.registerHandler("show", this.show, this);
		this.registerHandler("hide", this.hide, this);
		this.registerHandler("close", this.close, this);
		this.registerHandler("updateButtons", this.updateButtons, this);
	};

	if (!exports.VideoDetailsView) { exports.VideoDetailsView = VideoDetailsView; }
})(window);
