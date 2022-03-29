(function(exports){
  "use strict";

  /*
    Contains helper methods to simply using ZypeJSBase
    - most methods accept an instance of ZypeJSBase (zypeApi) with app_key, client_id and client_secret already initialized along other parameters
    - helper methods are for instances where certain operations require multiple calls to Zype APIs and/or require parsing of response(s) for useful info
  */
  let ZypeApiHelpers = function(){
    let _this = this;

    /*
      Accepts marketplace and product id.
      Resolves with first plan that has matching product id under marketplace ids

      Plan: {
        marketplace_ids: {
          samsung_tizen: SAMSUNG_PRODUCT_ID,
          MARKETPLACE_NAME: PRODUCT_ID
        }
        ...
      }
    */
    this.findPlanByMarketplaceId = (zypeApi, marketplace, productId) => {
      return new Promise((resolve, reject) => {
        let params = { "per_page": 500 };

        zypeApi.getPlans(params)
        .then(
          resp => {
            let plans = resp.response;
            let matchingPlan;

            for (let i = 0; i < plans.length; i++) {
              const plan = plans[i];
              if (plan.marketplace_ids && plan.marketplace_ids[marketplace] == productId) {
                matchingPlan = plan;
                break;
              }
            }

            if (matchingPlan) {
              resolve(matchingPlan);
            } else {
              reject(null);
            }
          },
          err => {
            reject(null);
          }
        );
      });
    };

    this.searchVideos = (zypeApi, query, playlistId) => {
      return new Promise((resolve, reject) => {
        let params = {
          "q": query,
          "per_page": 500,
          "playlist_id.inclusive": playlistId || "",
          "order": "desc",
          "sort": "created_at"
        };

        zypeApi.getVideos(params)
        .then(
          resp => {
            let videos = resp.response;
            resolve(videos);
          },
          err => { // error. return empty array
            resolve([]);
          }
        );
      });
    };

    // Accepts access token, Resolves with consumer object
    this.getConsumer = (zypeApi, accessToken) => {
      return new Promise((resolve, reject) => {
        zypeApi.getAccessTokenStatus(accessToken)
        .then(
          tokenStatus => {
            let consumerId = tokenStatus.resource_owner_id;
            if (consumerId) {
              zypeApi.getConsumer(consumerId, accessToken, {})
              .then(
                consumerResp => resolve(consumerResp.response),
                err => reject(err)
              );
            } else {
              reject(null);
            }
          },
          err => reject(err)
        );
      });
    };

    this.getPlaylistChildren = (zypeApi, playlistId) => {
      return new Promise((resolve, reject) => {
        let params = {
          parent_id: playlistId,
          per_page: 50,
          sort: "priority",
          order: "dsc",
          page: 1
        };

        zypeApi.getPlaylists(params)
        .then(
          (playlistsResp) => {
            let playlistChildrenArray = [];

            if (playlistsResp && playlistsResp.response.length > 0) {
              let playlists = playlistsResp.response;

              let functionCallsArray = [];
              for (let i = 0; i < playlists.length; i++) {
                // video playlist
                if (playlists[i].playlist_item_count > 0){
                  functionCallsArray.push([
                    zypeApi.getPlaylistVideos,
                    [ playlists[i]._id, {per_page: 500} ]
                  ]);

                  playlistChildrenArray.push({
                    id: playlists[i]._id,
                    type: "videos",
                    title: playlists[i].title,
                    thumbnailLayout: playlists[i].thumbnail_layout
                  });
                }
                // playlist of playlists
                else {
                  functionCallsArray.push([
                    zypeApi.getPlaylists,
                    [ {parent_id: playlists[i]._id, per_page: 500, sort: "priority", order: "dsc"} ]
                  ]);

                  playlistChildrenArray.push({
                    id: playlists[i]._id,
                    type: "playlists",
                    title: playlists[i].title,
                    thumbnailLayout: playlists[i].thumbnail_layout
                  })
                }
              }

              zypeApi.callMultiple(functionCallsArray)
              .then(
                (resps) => {
                  for (let i = 0; i < playlistChildrenArray.length; i++) {
                    playlistChildrenArray[i].content = resps[i].response;
                  }

                  resolve(playlistChildrenArray)
                },
                (err) => {
                  reject(err);
                }
              );

            }
            else {
              zypeApi.getPlaylist(playlistId, {})
              .then(
                (playlistResp) => {
                  let playlist = playlistResp.response;

                  zypeApi.getPlaylistVideos(playlistId, {per_page: 500})
                  .then(
                    (resp) => {
                      playlistChildrenArray.push({
                        type: "videos",
                        title: playlist.title,
                        thumbnailLayout: playlist.thumbnail_layout,
                        content: resp.response
                      });

                      resolve(playlistChildrenArray);
                    },
                    (err) => { reject(err); }
                  );
                },
                (err) => { reject(err); }
              );
            }
          },
          (err) => { reject(err); }
        );
      });
    }; // getPlaylistChildren()

    // Accepts access token. Promise resolves with consumer id
    this.getConsumerIdFromAccessToken = (zypeApi, accessToken) => {
      return new Promise((resolve, reject) => {
        let rejectCb = err => reject(null);
        zypeApi.getAccessTokenStatus(accessToken).then(
          (resp) => {
            let consumerId = resp.resource_owner_id;
            if (consumerId) {
              resolve(consumerId);
            } else {
              rejectCb();
            }
          },
          rejectCb
        );
      });
    };

    // Accepts array of video ids. Promise resolves with array of associated video objects
    this.getVideosFromArray = (zypeApi, videoIds) => {
      return new Promise((resolve, reject) => {
        let rejectCb = err => reject(null);

        // array of GET video calls
        let getVideoCalls = videoIds.map(id => [zypeApi.getVideo, [id, {}]]);

        zypeApi.callMultiple(getVideoCalls)
        .then(
          videoResps => {
            const videos = videoResps.map(videoResp => videoResp.response);
            resolve(videos);
          },
          rejectCb
        );
      });
    };

    /*
      Accepts access token. Resolves promise with array of video objects
      - need helper because Zype's video favorites API does not return full video object

      Note: may not be needed if API is updated in future
    */
    this.getConsumerFavorites = (zypeApi, accessToken) => {
      return new Promise((resolve, reject) => {
        let rejectCb = err => reject(null);

        this.getConsumerIdFromAccessToken(zypeApi, accessToken).then(
          consumerId => {
            zypeApi.getConsumerVideoFavorites(consumerId, accessToken)
            .then(
              resp => {
                const videoIds = resp.response.map(videoFav => videoFav.video_id);

                this.getVideosFromArray(zypeApi, videoIds)
                .then(
                  videos => { resolve(videos); },
                  rejectCb
                )
              },
              rejectCb
            );
          },
          rejectCb
        );
      });
    };

  };

  exports.ZypeApiHelpers = new ZypeApiHelpers();
})(window);
