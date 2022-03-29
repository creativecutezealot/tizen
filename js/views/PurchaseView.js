(function(exports){
  "use strict";

  let PurchaseView = function(){
    EventsHandler.call(this, [
      "loadComplete",
      "show",
      "hide",
      "close"
    ]);

    let _this = this;

    this.video = null;
    this.products = [];

    // MARK: - HTML ids
    let templateId = "#purchase-view-template";
    let purchaseContainerId = "#purchase-container";

    this.id = null;
    this.productIndex = null;

    const viewText = {
      header: "Select Plan:",
      description: "You need to be a " + appDefaults.displayName + " subscriber to watch this content. <br> Purchase a subscription for access to subscription content on all devices",
      signInText: "Already have an account?",
      signInButton: appDefaults.labels.signInButton,
      signedInText: "Signed in as:"
    };
    
    /**
     * Initialization
     */
    this.init = args => {
      this.video = args.video;
      this.products = args.products;

      let id = "purchase-view-" + this.video._id;
      this.id = "#" + id;

      let text = viewText;

      let context = {
        video: this.video,
        products: this.formattedProducts(this.products),
        css: {
          classes: { theme: appDefaults.theme },
          brandColor: appDefaults.brandColor,
          ids: { id: id }
        },
        images: {
          appIcon: appDefaults.appIconUrl
        },
        text: text
      };

      this.productIndex = 0;

      let template = $(templateId);
      let renderedTemplate = Utils.buildTemplate(template, context);
      $(purchaseContainerId).append(renderedTemplate);

      this.trigger("loadComplete");
    };

    /**
     * Helpers
     */
    this.formattedProducts = products => {
      let formattedProducts = products;

      for (let i = 0; i < formattedProducts.length; i++) {
        formattedProducts[i].Price = formattedProducts[i].Price.toFixed(2); // number to decimal string
      }

      return formattedProducts;
    };


    /**
     * Update view
     */
    this.unfocusProducts = () => $(this.id + " .product").removeClass("focused");

    this.focusProduct = () => {
      // Currently selected product
      let currentProduct = $(this.id).find(".product")[this.productIndex];
      $(currentProduct).addClass("focused");
    };

    this.moveProductsPosition = () => {
      let productsContainer = $(this.id).find(".purchase-options")[0];

      let product = $(this.id).find(".product")[0];
      let productWidth = $(product).width();
      let productMargin = productWidth * 0.10;
      let newLeft = -(this.productIndex * (productWidth + productMargin));

      $(productsContainer).css("position", "absolute").animate({
        "left": String(newLeft) + "px"
      }, 250);
    };

    this.setFocusedProduct = index => {
      if (this.products[index]) {
        this.productIndex = index;
        this.unfocusProducts();
        this.moveProductsPosition();
        this.focusProduct();
      }
    };

    // hide both sign in text and signed in text
    this.hideAuth = () => {
      $(this.id + " .signed-in-container").addClass("invisible");
      $(this.id + " .signin-text-container").addClass("invisible");
    };

    this.showSignedIn = () => {
      this.hideAuth();
      $(this.id + " .signed-in-container").removeClass("invisible");
    };

    this.showSignIn = () => {
      this.hideAuth();
      $(this.id + " .signin-text-container").removeClass("invisible");
    };

    this.focusSignInButton = () => $(this.id + " .signin-button").addClass("focused");

    this.unfocusSignInButton = () => $(this.id + " .signin-button").removeClass("focused");

    this.updateEmail = email => $(this.id + " .email").text(email);

    // MARK: - Update view state
    this.show = () => {
      $(this.id).removeClass("invisible");
      this.unfocusSignInButton();
      this.setFocusedProduct(this.productIndex);
    };
    this.hide = () => $(this.id).addClass("invisible");
    this.close = () => $(this.id).remove();

    this.registerHandler("loadComplete", this.show, this);
    this.registerHandler("show", this.show, this);
    this.registerHandler("hide", this.hide, this);
    this.registerHandler("close", this.close, this);
  };

  if (!exports.PurchaseView) { exports.PurchaseView = PurchaseView; };
})(window);
