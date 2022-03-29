(function(exports){

	/**
	 * Gets filenames to be loaded based on platform
	 * 
	 * @param {String} 	platform platform type of app
	 * @return {Object}	Object of filenames to be loaded by app
	 */
	var getNativePlatformLibs = function(platform){
		var nativePlatformLibs = null;
		var basePath = null;

		switch (platform){
			case "samsung":
				basePath = "lib/platforms/samsung/";

				nativePlatformLibs = {
					keyCodes: basePath + "TvKeys.js",
					nativePlatform: basePath + "NativePlatform.js",
					nativePlayerController: basePath + "VideoPlayerController.js",
					deepLink: basePath + "deeplink.js",
					nativeMarket: basePath + "NativeMarket.js"
				};
				break;
			
			// samsung
			default:
				basePath = "lib/platforms/samsung/";

				nativePlatformLibs = {
					keyCodes: basePath + "TvKeys.js",
					nativePlatform: basePath + "NativePlatform.js",
					nativePlayerController: basePath + "VideoPlayerController.js",
					deepLink: basePath + "deeplink.js",
					nativeMarket: basePath + "NativeMarket.js"
				};
				break;
		}

		return nativePlatformLibs;
	};

	exports.getNativePlatformLibs = getNativePlatformLibs;
})(window);