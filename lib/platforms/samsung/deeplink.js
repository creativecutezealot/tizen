(function(exports){
	"use strict";

	var handleDeepLinkedData = function(){
		try {
			
			var requestedAppControl = tizen.application.getCurrentApplication().getRequestedAppControl();

			var payload = null;

			if (requestedAppControl){
				var deepLinkedData = requestedAppControl.appControl.data;

				for (var i = 0; i < deepLinkedData.length; i++) {
					if (deepLinkedData[i].key == "PAYLOAD"){
						payload = JSON.parse(deepLinkedData[i].value[0]).values;
					}
				}
				
			}

			exports.deepLinkedData = payload;

		} catch (error) {}
	};

	exports.handleDeepLinkedData = handleDeepLinkedData;
})(window);