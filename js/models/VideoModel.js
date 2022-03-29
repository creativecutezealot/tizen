var VideoModel = function(args) {
    var _this = this;
    this.id = args.id || args._id;
    this.title = args.title;
    this.description = args.description || "";
    this.thumbnails = args.thumbnails;
    this.images = args.images;
    this.onAir = args.on_air;

    // Monetization
    this.subscriptionRequired = args.subscription_required;
    this.subscriptionAdsEnabled = args.subscription_ads_enabled;
    this.passRequired = args.pass_required;

    this.getRegularThumbnailUrl = function() {
        for (i = 0; i < _this.thumbnails.length; i++) {
            var thumbnail = _this.thumbnails[i];

            if (thumbnail.width !== null && thumbnail.width >= 240) return thumbnail.url;
        }
        return appDefaults.thumbnailUrl;
    };

    this.getLargeThumbnailUrl = function() {
        var thumbnailUrl;
        var maxWidth = 0;
        for (i = 0; i < _this.thumbnails.length; i++) {
            var thumbnail = _this.thumbnails[i];

            if (thumbnail.width !== null && thumbnail.width >= maxWidth) {
                maxWidth = thumbnail.width;
                thumbnailUrl = thumbnail.url;
            };
        }
        return thumbnailUrl || appDefaults.thumbnailUrl;
    };

    this.getPosterThumbnailUrl = function() {
        if (_this.images){
            for (i = 0; i < _this.images.length; i++) {
                var image = _this.images[i];
                if (image.layout == "poster") return image.url;
            }
        }

        return this.getRegularThumbnailUrl();
    };

    this.smallThumbnailUrl = this.getRegularThumbnailUrl();
    this.largeThumbnailUrl = this.getLargeThumbnailUrl();
    this.posterThumbnailUrl = this.getPosterThumbnailUrl();
};
