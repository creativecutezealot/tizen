(function(exports){
	"use strict";

	var NativePlatform = function(){
		let _this = this;

		let webapisDefined = !(typeof webapis === "undefined");

		// Calback
		this.createController = null;

		this.exit = () => {
			try {
				if (webapisDefined) {
					tizen.application.getCurrentApplication().exit();
				} else {
					alert("Exiting");
				}
			} catch(e){ console.log(e); }
		};

		this.isNetworkConnected = () => {
			try {
				return (webapisDefined) ? webapis.network.isConnectedToGateway() : navigator.onLine; 
			} catch(e){ console.log(e); }
		};

		this.attachNetworkChangeCallbacks = (disconnectedCallback, reconnectedCallback) => {
			try {
				if (webapisDefined) {
					let networkChangeCallback = value => {
						if (value == webapis.network.NetworkState.GATEWAY_DISCONNECTED) {
							disconnectedCallback();
						} else if (value == webapis.network.NetworkState.GATEWAY_CONNECTED) {
							reconnectedCallback();
						}
					};

					webapis.network.addNetworkStateChangeListener(networkChangeCallback);
				} else {
					window.addEventListener("offline", disconnectedCallback);
					window.addEventListener("online", reconnectedCallback);
				}
			} catch(e){ console.log(e); }
		};

		this.setReLinkCallback = callback => {
			this.createController = callback;
		};

		// handleReLink() handles deep linking inside app
		this.handleReLink = () => {
			showSpinner();
			if (handleDeepLinkedData){ handleDeepLinkedData() }

			// if deep linked, try to show video else, else show self
			if(exports.deepLinkedData) {
				let parsedData = JSON.parse(exports.deepLinkedData);

				zypeApi.getVideo(parsedData.videoId, {})
				.then(
					resp => {
						_this.createController(VideoDetailsController, { content: [resp.response], index: 0 });
					},
					err => { hideSpinner(); }
				);
			} else {
				hideSpinner();
			}
		};
	};

	exports.NativePlatform = new NativePlatform();
})(window);