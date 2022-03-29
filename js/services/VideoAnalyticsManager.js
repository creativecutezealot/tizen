var VideoAnalyticsManager = function(args){
	"use strict";

	window.AKAMAI_MEDIA_ANALYTICS_CONFIG_FILE_PATH = args.beacon;

	// MARK: - Setup plugin
	this.akamaiPlugin = new AkaHTML5MediaAnalytics({
		streamHeadPosition: 0,
		streamLength: args.duration,
		streamUrl: args.url
	});

	if (args.dimensions.consumerId) this.akamaiPlugin.setData("viewerId", args.dimensions.consumerId);

	for (const dim in args.dimensions) {
		this.akamaiPlugin.setData(dim, args.dimensions[dim]);
	}

	// MARK: - Event Handlers
	this.handleInitSession = () => this.akamaiPlugin.handleSessionInit();

	this.handlePlay = () => this.akamaiPlugin.handlePlaying();
	this.handlePause = () => this.akamaiPlugin.handlePause();
	this.handleResume = () => this.akamaiPlugin.handleResume();

	// call when video stops bc viewer stopped using app (network disconnect, changed app)
	this.handleAppExit = () => this.akamaiPlugin.handleApplicationExit();

	this.handleError = error => {
		if (error) {
			this.akamaiPlugin.handleError(error);
		}
		else {
			this.akamaiPlugin.handleError();
		}
	};

	this.handleEnd = endReason => {
		if (endReason) {
			this.akamaiPlugin.handlePlayEnd(endReason);
		}
		else {
			this.akamaiPlugin.handlePlayEnd();
		}
	};

	this.handleBitRateChange = newBitrate => this.akamaiPlugin.handleBitRateSwitch(newBitrate);
	this.handleBufferStart = () => this.akamaiPlugin.handleBufferStart();
	this.handleBufferEnd = () => this.akamaiPlugin.handleBufferEnd();
};