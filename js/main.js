"use strict";

$(document).ready(() => {
  loadTemplates()
  .then(() => {

    let nativePlatformLibs = getNativePlatformLibs(appDefaults.platform);

    // load files
    $.when(
      $.getScript(nativePlatformLibs.deepLink),
      $.getScript("js/helpers/spinner.js"),

      // Get dependencies
      $.getScript("lib/ZypeEndpoints.js"),
      $.getScript("lib/ZypeJSBase.js"),
      $.getScript("lib/EventsHandler.js"),
      $.getScript(nativePlatformLibs.nativeMarket),

      $.getScript("js/helpers/zype-api-helpers.js"),
      $.getScript("js/helpers/css-helpers.js"),
      $.getScript("js/helpers/format-helpers.js"),

			$.getScript("lib/akamai/akamai.min.js"),
			$.getScript("js/services/VideoAnalyticsManager.js"),
			$.getScript("js/services/StorageManager.js"),

      // Models
      $.getScript(nativePlatformLibs.keyCodes),
      $.getScript("js/models/VideoModel.js"),
      $.getScript("js/models/PlaylistModel.js"),

      // Views
      $.getScript("js/views/PurchaseView.js"),
      $.getScript("js/views/ConfirmDialogView.js"),
      $.getScript("js/views/DescriptionDialogView.js"),
      $.getScript("js/views/AccountView.js"),
      $.getScript("js/views/NavigationView.js"),
      $.getScript("js/views/CredentialsInputView.js"),
      $.getScript("js/views/DialogView.js"),
      $.getScript("js/views/VideoPlayerView.js"),
      $.getScript("js/views/VideoDetailsView.js"),
      $.getScript("js/views/MediaGridView.js"),
      $.getScript("js/views/MediaGridSliderView.js"),
      $.getScript("js/views/SearchView.js"),
      $.getScript("js/views/FavoritesView.js"),

      // Controllers
      $.getScript("js/controllers/PurchaseController.js"),
      $.getScript("js/controllers/OAuthController.js"),
      $.getScript("js/controllers/AccountController.js"),
      $.getScript("js/controllers/DialogController.js"),
      $.getScript(nativePlatformLibs.nativePlayerController),
      $.getScript("js/controllers/VideoDetailsController.js"),
      $.getScript("js/controllers/MediaGridController.js"),
      $.getScript("js/controllers/MediaGridSliderController.js"),
      $.getScript("js/controllers/SearchController.js"),
      $.getScript("js/controllers/FavoritesController.js"),

      $.getScript(nativePlatformLibs.nativePlatform),
      $.getScript("js/controllers/AppController.js")

    // handle app load
    ).then(() => {
      // only if deep linking required
      if (handleDeepLinkedData){ handleDeepLinkedData() };

      if (window.innerWidth < window.innerHeight) {
        $("#overlay-message").html("please rotate your device back to landscpe");
        $("#app-overlay").css("display", "block");
      } else {
        $("#overlay-message").html("");
        $("#app-overlay").css("display", "none");
      }

      $("body").addClass(appDefaults.theme);
      let app = new AppController();
      app.init({});
    });
  });
});
