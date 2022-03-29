(function(exports) {
	"use strict";

	let NavigationView = function() {
		EventsHandler.call(this, [
			"loadComplete",
			"show",
			"hide",
			"close",
			"unfocusTabs",
			"focusTab",
			"incrementTab",
			"decrementTab"
		]);

		let _this = this;

		// MARK: - HTML ids
		let templateId = "#navigation-view-template";
		let containerId = "#navs-container";

		// MARK: - Properties
		this.id = null;
		this.currentIndex = null;
		this.tabs = [];

		// MARK: - Initization
		this.init = args => {
			this.currentIndex = 0;
			this.id = "#" + args.css.ids.id;

			this.tabs = this.getTabs();

			let context = {
				css: args.css,
				tabs: this.tabs
			};

			let template = $(templateId);
			let renderedTemplate = Utils.buildTemplate(template, context);
			$(containerId).append(renderedTemplate);

			// Set dynamic color
			let selector = ".navigation-tabs-container .navigation-tab.focused .nav-tab-text";
			let properties = { "color": appDefaults.brandColor };
			let dynamicStyle = CssHelpers.createStyle(selector, properties);
			$(this.id).append(dynamicStyle);

			this.focusTab();

			this.trigger("loadComplete");
		};

		// MARK: - Helper Methods
		/**
		 * getTabs() returns array of tab objects to append to DOM
		 * @return {Object[]} - array of tab objects
		 */
		this.getTabs = () => {
			let tabs = [
				{ index: "0", title: "Home", role: "home"},
				{ index: "1", title: "Search", role: "search" }
			];

			// Comment below out if not using signin
//			let accountTab = { index: "2", title: "Account", role: "account" };
//			tabs.push(accountTab);

			tabs.push({index: "2", title: "Favorites", role: "favorites"});

			return tabs;
		};

		// incrementIndex() increases this.currentIndex if possible
		this.incrementIndex = () => {
			if (this.tabs.length - 1 > this.currentIndex) this.currentIndex += 1;
		};
		// decrementIndex() decreases this.currentIndex if possible
		this.decrementIndex = () => {
			if (this.currentIndex > 0) this.currentIndex -= 1;
		};

		// MARK: - Update DOM methods

		// unfocusTabs() removes "focused" class from tabs
		this.unfocusTabs = () => {
			$(this.id + " .navigation-tab").removeClass("focused");
		};

		// focusTab() adds "focused" class to current index
		this.focusTab = () => {
			let query = this.id + " .navigation-tab[index=\'" + String(this.currentIndex) + "\'";
			$(query).addClass("focused");
		};

		// incrementTab() increments and focuses tab
		this.incrementTab = () => {
			this.incrementIndex();
			this.trigger("unfocusTabs");
			this.trigger("focusTab");
		};

		// incrementTab() increments and focuses tab
		this.decrementTab = () => {
			this.decrementIndex();
			this.trigger("unfocusTabs");
			this.trigger("focusTab");
		};

		this.currentTab = () => this.tabs[this.currentIndex];

		// MARK: - Key callback methods
		this.show = () => $(this.id).removeClass("invisible");
		this.hide = () => $(this.id).addClass("invisible");
		this.close = () => $(this.id).remove();

		// MARK:- event handler registration
		this.registerHandler("loadComplete", this.show, this);
		this.registerHandler("show", this.show, this);
		this.registerHandler("hide", this.hide, this);
		this.registerHandler("close", this.close, this);
		this.registerHandler("unfocusTabs", this.unfocusTabs, this);
		this.registerHandler("focusTab", this.focusTab, this);
		this.registerHandler("incrementTab", this.incrementTab, this);
		this.registerHandler("decrementTab", this.decrementTab, this);
	};

	if (!exports.NavigationView) exports.NavigationView = NavigationView;
})(window);
