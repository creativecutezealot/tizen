/*
 * ZypeEndpoints - Module for getting different routes for Zype API
 */
var ZypeEndpoints = {
  api: {
    getApp: function(){ return "app" },

    getVideos: function(){ return "videos" },
    getVideo: function(videoId){ return "videos/" + videoId },

    getPlaylists: function(){ return "playlists" },
    getPlaylist: function(playlistId){ return "playlists/" + playlistId },
    getPlaylistVideos: function(playlistId){ return "playlists/" + playlistId + "/videos" },

    getCategories: function(){ return "categories" },
    getCategory: function(categoryId){ return "categories/" + categoryId },

    getConsumer: function(consumerId){ return "consumers/" + consumerId },
    createConsumer: function(){ return "consumers" },

    getPinStatus: function(){ return "pin/status" },
    createPin: function(){ return "pin/acquire" },
    linkDevice: function(){ return "pin/link" },
    unlinkDevice: function(){ return "pin/unlink" },

    checkVideoEntitlement: function(videoId){ return "videos/" + videoId + "/entitled" },
    getConsumerVideoEntitlements: function(){ return "consumer/videos" },
    getConsumerPlaylistEntitlements: function(){ return "consumer/playlists" },

    getPlans: function(){ return "plans" },
    getPlan: function(planId){ return "plans/" + planId },

    getConsumerVideoFavorites: function(consumerId){ return "consumers/" + consumerId + "/video_favorites" },
    createConsumerVideoFavorite: function(consumerId){ return "consumers/" + consumerId + "/video_favorites" },
    deleteConsumerVideoFavorite: function(consumerId, videoFavoriteId){ return "consumers/" + consumerId + "/video_favorites/" + videoFavoriteId },

    forgotPassword: function(){ return "consumers/forgot_password" },

    getZObjectTypes: function(){ return "zobject_types" },
    getZObjectType: function(zobjectTypeId){ return "zobject_types/" + zobjectTypeId },

    getZObjects: function(){ return "zobjects" },
    getZObject: function(zobjectId){ return "zobjects/" + zobjectId },
  },
  player: {
    getPlayer: function(videoId){ return "embed/" + videoId },
  },
  login: {
    createAccessToken: function(){ return "oauth/token" },
    getAccessTokenStatus: function(){ return "oauth/token/info" },
    refreshAccessToken: function(){ return "oauth/token" }
  },
};
