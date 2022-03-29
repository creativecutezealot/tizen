(function(exports){
  var getTemplates = function(){
    var templateSources = [
      "templates/media-grid-view.html",
      "templates/media-grid-slider-view.html",
      "templates/video-details-view.html",
      "templates/video-player-view.html",
      "templates/dialog-view.html",
      "templates/video-player-ui-view.html",
      "templates/credentials-input-view.html",
      "templates/buttons-view.html",
      "templates/navigation-view.html",
      "templates/account-view.html",
      "templates/buttons-col-view.html",
      "templates/confirm-dialog-view.html",
      "templates/search-view.html",
      "templates/purchase-view.html",
      "templates/favorites-view.html"
    ];

    var getTemplate = function(templateSource){
      return $.ajax(templateSource);
    };

    var templatePromises = templateSources.map(getTemplate);

    return Promise.all(templatePromises);
  }

  function loadTemplates(){
    return new Promise(function(resolve, reject){
      getTemplates().then(
        function(tmpls){
          for (var i = 0; i < tmpls.length; i++) {
            $("#template-loader").append(tmpls[i]);
          }
          resolve(true);
        },
        function(){ reject(false); }
      )
    });
  }

  exports.loadTemplates = loadTemplates;
})(window);
