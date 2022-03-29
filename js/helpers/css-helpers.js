(function(exports){
	"use strict";

	let CssHelpers = function(){
		// MARK:- Private Methods

		/**
		 * buildSelector() returns formatted selector string
		 * @param {*} selector 
		 * @param {*} properties 
		 */
		let buildSelector = (selector, properties) => {
			let propertiesString = "";

			for (let prop in properties){
				let newProp = String(prop) + ": " + properties[prop] + ";";
				propertiesString += newProp;
			}

			return selector + " { " + propertiesString + " } ";
		};

		// MARK:- Public Methods

		/**
		 * createStyle() returns style element with single selector
		 * 	assumes that selectors and selectorProperties are same length
		 * @param {String[]} selector - string of selector
		 * @param {Object[]} properties - object array of properties to create
		 */
		this.createStyle = (selector, properties) => {
			let style = document.createElement("style");
			style.type = "text/css";
			style.innerText = buildSelector(selector, properties);

			return style;
		};

		/**
		 * createStyles() returns style element with multiple selectors
		 * 	assumes that selectors and selectorProperties are same length
		 * @param {String[]} selectors - string array of selectors
		 * @param {Object[]} selectorProperties - object array of properties
		 */
		this.createStyles = (selectors, selectorProperties) => {
			let propertiesString = "";

			for (let i = 0; i < selectors.length; i++){
				let selector = selectors[i], properties = selectorProperties[i];
				propertiesString += buildSelector(selector, properties);
			}

			let style = document.createElement("style");
			style.type = "text/css";
			style.innerText = propertiesString;

			return style;
		};
	};

	exports.CssHelpers = new CssHelpers();
})(window);
