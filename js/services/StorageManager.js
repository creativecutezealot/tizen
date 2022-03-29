(function(exports){
  "use strict";

  let PlaybackTimes = function(){
    let _this = this;

    let videoPlaybackKey = videoId => videoId + "-time";

    // getVideoTime() return playback time float or null
    this.getVideoTime = videoId => {
      let playbackKey = videoPlaybackKey(videoId);
      let playbackTime = localStorage.getItem(playbackKey);

      if (playbackTime) return parseInt(playbackTime);
      return null;
    };

    this.setVideoTime = (videoId, time) => {
      let stringTime = String(time);
      let playbackKey = videoPlaybackKey(videoId);
      localStorage.setItem(playbackKey, stringTime);
    };

    this.deleteVideoTime = videoId => {
      let playbackKey = videoPlaybackKey(videoId);
      localStorage.removeItem(playbackKey);
    };
  };

  // StorageManager
  let StorageManager = function(){
    let _this = this;

    this.playbackTimes = new PlaybackTimes();
  };

  exports.StorageManager = new StorageManager();
})(window);
