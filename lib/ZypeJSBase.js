/*
 * ZypeJSBase - Javascript library integrated with Zype API for use in web apps
 *  - If not set, remember to configure the clientId, clientSecret and appKey
 *  - Methods return a promise with response json for success and null for failure
 *
 *
 *  Dependencies (require loading before ZypeJSBase)
 *    - jQuery
 *    - ZypeEndpoints.js
 */
(function(){
  "use strict";

  function zypeUrl(subdomain, path){ return "https://" + subdomain + ".zype.com/" + path; }

  // Returns promise containing response json or null
  function httpRequest(method, url, params){
    var def = new $.Deferred();
    $.ajax({
      url: url,
      type: method,
      crossDomain: true,
      dataType: 'json',
      xhrFields: { withCredentials: true },
      data: params
    })
    .done(function(resp){
      def.resolve(resp);
    })
    .fail(function(xhr, status, err){
      def.reject(xhr.responseJSON);
    });

    return def.promise();
  }

  var zypeExport = function(configs){ return new ZypeJSBase(configs) };

  var ZypeJSBase = function(configs){
    var _this = this;

    // Set configs
    this.clientId = configs.clientId;
    this.clientSecret = configs.clientSecret;
    this.appKey = configs.appKey;

    // App
    this.getApp = function(){
      var url = zypeUrl("api", ZypeEndpoints.api.getApp());
      return httpRequest("GET", url, {app_key: this.appKey});
    };

    // Videos
    this.getVideos = function(params){
      var url = zypeUrl("api", ZypeEndpoints.api.getVideos());
      params.app_key = this.appKey;
      return httpRequest("GET", url, params);
    };

    this.getVideo = function(videoId, params){
      var url = zypeUrl("api", ZypeEndpoints.api.getVideo(videoId));
      params.app_key = this.appKey;
      return httpRequest("GET", url, params);
    };

    // Playlists
    this.getPlaylists = function(params){
      var url = zypeUrl("api", ZypeEndpoints.api.getPlaylists());
      params.app_key = this.appKey;
      return httpRequest("GET", url, params);
    };

    this.getPlaylist = function(playlistId, params){
      var url = zypeUrl("api", ZypeEndpoints.api.getPlaylist(playlistId));
      params.app_key = this.appKey;
      return httpRequest("GET", url, params);
    };

    this.getPlaylistVideos = function(playlistId, params){
      var url = zypeUrl("api", ZypeEndpoints.api.getPlaylistVideos(playlistId));
      params.app_key = this.appKey;
      return httpRequest("GET", url, params);
    };

    // Categories
    this.getCategories = function(params){
      var url = zypeUrl("api", ZypeEndpoints.api.getCategories());
      params.app_key = this.appKey;
      return httpRequest("GET", url, params);
    };

    this.getCategory = function(categoryId, params){
      var url = zypeUrl("api", ZypeEndpoints.api.getCategory(categoryId));
      params.app_key = this.appKey;
      return httpRequest("GET", url, params);
    };

    // Consumers
    this.getConsumer = function(consumerId, accessToken, params){
      var url = zypeUrl("api", ZypeEndpoints.api.getConsumer(consumerId));
      params.access_token = accessToken;
      return httpRequest("GET", url, params);
    };

    this.createConsumer = function(params){
      var url = zypeUrl("api", ZypeEndpoints.api.createConsumer());
      params.app_key = this.appKey;
      return httpRequest("POST", url, params);
    };

    this.triggerForgotPassword = function(email){
      let url = zypeUrl("api", ZypeEndpoints.api.forgotPassword());
      let params = {
        email: email || "",
        app_key: this.appKey
      };
      return httpRequest("PUT", url, params);
    };

    // Device Linking
    this.createPin = function(uuid){
      var url = zypeUrl("api", ZypeEndpoints.api.createPin());
      return httpRequest("POST", url, {app_key: this.appKey, linked_device_id: uuid});
    };

    // Checks status of pin using device's UUID (used to see if consumer linked device)
    this.getPinStatus = function(uuid){
      var url = zypeUrl("api", ZypeEndpoints.api.getPinStatus());
      return httpRequest("GET", url, {app_key: this.appKey, linked_device_id: uuid});
    };

    this.linkDevice = function(consumerId, pin){
      var url = zypeUrl("api", ZypeEndpoints.api.linkDevice());
      var params = {
        app_key: this.appKey,
        _method: "put",
        consumer_id: consumerId,
        pin: pin
      };
      return httpRequest("POST", url, params);
    };

    // Used to unlink device from consumer account
    this.unlinkDevice = function(consumerId, pin){
      var url = zypeUrl("api", ZypeEndpoints.api.unlinkDevice());
      var params = {
        app_key: this.appKey,
        _method: "put",
        consumer_id: consumerId,
        pin: pin
      };
      return httpRequest("POST", url, params);
    };

    // OAuth
    this.getAccessTokenStatus = function(accessToken){
      var url = zypeUrl("login", ZypeEndpoints.login.getAccessTokenStatus());
      return httpRequest("GET", url, {access_token: accessToken});
    };

    this.createDeviceLinkingAccessToken = function(uuid, pin){
      var url = zypeUrl("login", ZypeEndpoints.login.createAccessToken());
      var params = {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        linked_device_id: uuid,
        pin: pin,
        grant_type: "password"
      };
      return httpRequest("POST", url, params);
    };

    this.createLoginAccessToken = function(email, password){
      var url = zypeUrl("login", ZypeEndpoints.login.createAccessToken());
      var params = {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        username: email,
        password: password,
        grant_type: "password"
      };
      return httpRequest("POST", url, params);
    };

    this.refreshAccessToken = function(refresh_token){
      var url = zypeUrl("login", ZypeEndpoints.login.refreshAccessToken());
      var params = {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refresh_token,
        grant_type: "refresh_token"
      };
      return httpRequest("POST", url, params);
    };

    // Video Entitlements

    // Check if consumer entitled to video
    this.checkVideoEntitlement = function(videoId, accessToken){
      var url = zypeUrl("api", ZypeEndpoints.api.checkVideoEntitlement(videoId));
      return httpRequest("GET", url, { access_token: accessToken });
    };

    this.getConsumerVideoEntitlements = function(accessToken, params){
      var url = zypeUrl("api", ZypeEndpoints.api.getConsumerVideoEntitlements());
      params.access_token = accessToken;
      return httpRequest("GET", url, params);
    };

    this.getConsumerPlaylistEntitlements = function(accessToken, params){
      var url = zypeURl("api", ZypeEndpoints.api.getConsumerPlaylistEntitlements());
      params.access_token = accessToken;
      return httpRequest("GET", url, params);
    };

    // Plans
    this.getPlans = function(params){
      var url = zypeUrl("api", ZypeEndpoints.api.getPlans());
      params.app_key = this.appKey;
      return httpRequest("GET", url, params);
    };

    this.getPlan = function(planId, params){
      var url = zypeUrl("api", ZypeEndpoints.api.getPlan(planId));
      params.app_key = this.appKey;
      return httpRequest("GET", url, params);
    };

    // Video Favorites
    this.getConsumerVideoFavorites = function(consumerId, accessToken){
      var url = zypeUrl("api", ZypeEndpoints.api.getConsumerVideoFavorites(consumerId));
      return httpRequest("GET", url, { access_token: accessToken, per_page: 500 });
    };

    this.createConsumerVideoFavorite = function(consumerId, videoId, accessToken){
      var url = zypeUrl("api", ZypeEndpoints.api.createConsumerVideoFavorite(consumerId));
      return httpRequest("POST", url, { access_token: accessToken, video_id: videoId });
    };

    // Note: videoFavoriteId is not the same as videoId
    this.deleteConsumerVideoFavorite = function(consumerId, videoFavoriteId, accessToken){
      var url = zypeUrl("api", ZypeEndpoints.api.deleteConsumerVideoFavorite(consumerId, videoFavoriteId));
      return httpRequest("POST", url, { _method: "delete", access_token: accessToken });
    };

    // Zobject Types
    this.getZObjectTypes = function(params){
      var url = zypeUrl("api", ZypeEndpoints.api.getZObjectTypes());
      params.app_key = this.appKey;
      return httpRequest("GET", url, params);
    };

    this.getZObjectType = function(zobjectTypeId){
      var url = zypeUrl("api", ZypeEndpoints.api.getZObjectType(zobjectTypeId));
      return httpRequest("GET", url, { app_key: this.appKey });
    };

    // Zobjects
    this.getZObjects = function(zobjectType, params){
      var url = zypeUrl("api", ZypeEndpoints.api.getZObjects());
      params.app_key = this.appKey;
      params.zobject_type = zobjectType;
      return httpRequest("GET", url, params);
    };

    this.getZObject = function(zobjectId, zobjectType, params){
      var url = zypeUrl("api", ZypeEndpoints.api.getZObject(zobjectId));
      params.app_key = this.appKey;
      params.zobject_type = zobjectType;
      return httpRequest("GET", url, params);
    };

    // Get slider zobjects. Sorted by desc priority
    // Highest priority is first
    this.getSliders = () => {
      let zobjectType = "top_playlists";
      let params = {
        per_page: 500,
        page: 1,
        sort: "priority",
        order: "desc"
      };

      return _this.getZObjects(zobjectType, params);
    };

    // Video Player
    // params - should contain either appKey or accessToken
    this.getPlayer = function(videoId, params){
      var url = zypeUrl("player", ZypeEndpoints.player.getPlayer(videoId));
      return httpRequest("GET", url, params);
    };

    this.callMultiple = function(functionCallsArray){
        let promise = (functionCall) => functionCall[0].apply(_this, functionCall[1]);

        let promiseArray = functionCallsArray.map(promise);

        // return promise of response or null
        let resolvedPromises = promiseArray.map(p => p.catch(e => null));

        return Promise.all(resolvedPromises);
    };

    return this;
  }; // ZypeJSBase

  if(!window.ZypeJSBase) window.ZypeJSBase = zypeExport;

})();
