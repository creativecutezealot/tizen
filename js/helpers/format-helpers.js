(function(exports){
	"use strict";

	/** 
	 * FormatHelpers provides helpers for formatting data
	 * 	- methods accept data and return data in useable format
	 * 
	 * 
	 */
	let FormatHelpers = function(){

		/**
		 * getAkamaiAnalytics() returns object of data used for video player analytics
		 * Dependencies:
		 * 		js/helpers/object-helpers.js
		 * @param {Object} playerInfo 
		 * @param {Object} consumer 
		 */
		this.getAkamaiAnalytics = (playerInfo, consumer) => {
			let akamaiAnalytics = {
				beacon: null,
				dimensions: {}
			};

			if (playerInfo.body) {
				let body = playerInfo.body;

				if (body.analytics) {
					let analytics = body.analytics;

					if (analytics.beacon) akamaiAnalytics.beacon = analytics.beacon;

					if (analytics.dimensions) {
						let dimensions = analytics.dimensions;

						if (dimensions.video_id) akamaiAnalytics.dimensions.videoId = dimensions.video_id;
						if (dimensions.site_id) akamaiAnalytics.dimensions.siteId = dimensions.site_id;
						if (dimensions.player_id) akamaiAnalytics.dimensions.playerId = dimensions.player_id;
						if (dimensions.device) akamaiAnalytics.dimensions.device = dimensions.device;
					}
				}

				if (body.outputs) {
					let outputs = body.outputs;

					if (outputs.length > 0) {
						if (outputs[0].url) akamaiAnalytics.url = outputs[0].url;
					}
				}
			}

			if (playerInfo.video) {
				let video = playerInfo.video;

				if (video.title) akamaiAnalytics.dimensions.title = video.title;

				if (video.duration) akamaiAnalytics.duration = video.duration;
			}

			if (!ObjectHelpers.isObjectEmpty(consumer)) {
				if (consumer._id) akamaiAnalytics.dimensions.consumerId = consumer._id;
			}

			return akamaiAnalytics;
		};
	};

	exports.FormatHelpers = new FormatHelpers();
})(window);