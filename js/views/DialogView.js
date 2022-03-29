(function(exports){
    "use strict";

    var DialogView = function(){
		EventsHandler.call(this, ["loadComplete", "show", "hide", "close"]);
		var _this = this;

		var templateId = "#dialog-view-template";
		var dialogContainerId = "#dialogs-container";

		this.title = null;
		this.message = null;
		this.id = null;
		
		this.init = function(args){
			this.title = args.title;
			this.message = args.message;

			var dialogCount = $(".dialog-view").length;

			var id = "dialog-view-" + dialogCount;
			this.id = "#" + id;
			
			var context = {
				title: this.title,
				message: this.message,
				css: {
					classes: { theme: appDefaults.theme },
					ids: { id: id }
				}
			};

			var template = $(templateId);
            var renderedTemplate = Utils.buildTemplate(template, context);
            $(dialogContainerId).append(renderedTemplate);

            this.trigger("loadComplete");
		};

		this.show = function(){
			$(this.id).removeClass("invisible");
		};

		this.hide = function(){
			$(this.id).addClass("invisible");
		};

		this.close = function(){
			$(this.id).remove();
		};

		this.registerHandler("loadComplete", this.show, this);
		this.registerHandler("show", this.show, this);
		this.registerHandler("hide", this.hide, this);
		this.registerHandler("close", this.close, this);
	};

	if (!exports.DialogView) { exports.DialogView = DialogView; };
})(window);
