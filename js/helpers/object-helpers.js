(function(exports){
	"use strict";

	let ObjectHelpers = function(){
		this.getObjectName = obj => obj.constructor.name;

		this.isObjectEmpty = obj => Object.keys(obj).length === 0;
	};

	exports.ObjectHelpers = new ObjectHelpers();
})(window);