(function(exports){
  "use strict";

  let PurchaseController = function(){
    EventsHandler.call(this, [
      "loadComplete",
      "buttonPress",
      "show",
      "hide",
      "close",
      "networkDisconnect",
      "networkReconnect",
      "enterBackgroundState",
      "returnBackgroundState"
    ]);

    let _this = this;

    this.controllerIndex = null;

    this.view = null;
    this.video = null; // video that triggered purchase flow
    this.products = [];

    this.consumer = null;

    const ViewIndexes = {
      PRODUCTS: 0,
      SIGN_IN: 1
    };

    this.viewIndex = null;

    /**
     * Callbacks
     */
    this.createController = null; // create new controller
    this.removeSelf = null; // remove self

    this.init = options => {
      showSpinner();

      let args = options.args;
      let callbacks = options.callbacks;

      this.controllerIndex = args.controllerIndex;
      this.video = args.video;

      this.createController = callbacks.createController;
      this.removeSelf = callbacks.removeController;

      // fetch products callbacks
      let successCb = resp => {
        let cb = () => { this.createView() };
        this.fetchConsumerThenCallback(cb);
      };
      let errorCb = resp => {
        this.removeSelf();
      };

      // comment if debugging in browser
      this.fetchAssociatedProducts(successCb, errorCb);

      // uncomment if debugging in browser
      // this.products = appDefaults.mockData.products;
      // successCb();
    };

    /**
     * Private Helpers
     */

    this.fetchMatchingZypePlan = (productId, successCallback, errCallback) => {
      ZypeApiHelpers.findPlanByMarketplaceId(zypeApi, "samsung_tizen", productId)
      .then(successCallback, errCallback);
    };

    // fetchAssociatedProducts() - finds products associated with video and creates view if success
    this.fetchAssociatedProducts = (successCallback, errCallback) => {
      if (this.video) {
        // list support monetizations
        let subRequired = this.video.subscription_required;

        let productsCb = resp => {
          if (resp.ItemDetails && resp.ItemDetails.length > 0) {
            let products = [];

            for (let i = 0; i < resp.ItemDetails.length; i++) {
              let product = resp.ItemDetails[i];

              // TODO: Add logic for comparing product's ItemID to marketplace ids from Zype plans
              if (subRequired && product.ItemType == 4) products.push(product);
            }

            this.products = products;

            successCallback();
          } else {
            errCallback();
          }
        };

        // only works when running on device
        NativeMarket.requestProducts(appDefaults.marketplace, productsCb, errCallback);

      } else {
        errCallback();
      }
    };

    this.fetchConsumer = (accessToken, callback) => {
      ZypeApiHelpers.getConsumer(zypeApi, accessToken)
      .then(
        consumer => {
          this.consumer = consumer;
          callback();
        },
        err => {
          callback();
        }
      );
    };

    this.isSignedIn = () => (localStorage.getItem("accessToken")) ? true : false;

    this.purchaseSubscription = product => {
      ZypeApiHelpers.findPlanByMarketplaceId(zypeApi, "samsung_tizen", product.ItemID)
      .then(
        plan => { // found matching plan on Zype
          let transactionInfo = {
            "app_id": zypeAppSettings._id,
            "site_id": zypeAppSettings.site_id,
            "consumer_id": this.consumer._id,
            "plan_id": plan._id
          };

          let errorCb = err => {
            alert("Error purchasing: " + product.ItemTitle);
          };

          // callback for receipt validator
          let cb = resp => {
            let trialDays = product.SubscriptionInfo.freeTrialDayCount || 0;

            let receiptInfo = {
              "AppID": appDefaults.marketplace.appId,
              "InvoiceID": resp.InvoiceID,
              "CustomID": NativeMarket.getUdid(),
              "CountryCode": NativeMarket.getCountryCode(),
              "freeTrialDayCount": trialDays
            };

            let receiptValidatorCb = resp => {
              this.removeSelf();
              alert("Successful purchase: " + product.ItemTitle);
            };

            NativeMarket.callReceiptValidator(transactionInfo, receiptInfo, receiptValidatorCb, errorCb);
          };

          NativeMarket.purchaseAndGetInvoice(appDefaults.marketplace, product, cb, errorCb);
        },
        err => {
          alert("Error. Unable to find matching subscription");
        }
      )
    };

    // calls fetchConsumer() with callback function passed in
    this.fetchConsumerThenCallback = callback => {
      if (this.isSignedIn()) {
        let token = localStorage.getItem("accessToken");
        this.fetchConsumer(token, callback);
      } else {
        callback();
      }
    };

    this.createView = () => {
      let viewArgs = {
        video: this.video,
        products: this.products
      };

      let view = new PurchaseView();
      view.init(viewArgs);
      this.view = view;
      this.trigger("loadComplete");

      this.viewIndex = ViewIndexes.PRODUCTS;
      this.view.focusProduct();

      if (this.consumer) {
        this.view.updateEmail(this.consumer.email);
        this.view.showSignedIn();
      } else {
        this.view.showSignIn();
      }

      hideSpinner();
    };

    /**
     * Event Handlers
     */
    this.handleButtonPress = buttonPress => {
      switch (buttonPress) {
        case TvKeys.UP:
          this.viewIndex = ViewIndexes.PRODUCTS;
          this.view.unfocusSignInButton();
          this.view.focusProduct();
          break;

        case TvKeys.DOWN:
          if (!this.isSignedIn()){
            this.viewIndex = ViewIndexes.SIGN_IN;
            this.view.unfocusProducts();
            this.view.focusSignInButton();
          }
          break;

        case TvKeys.LEFT:
          if (this.viewIndex == ViewIndexes.PRODUCTS) {
            this.view.setFocusedProduct(this.view.productIndex - 1);
          }
          break;

        case TvKeys.RIGHT:
          if (this.viewIndex == ViewIndexes.PRODUCTS) {
            this.view.setFocusedProduct(this.view.productIndex + 1);
          }
          break
        case TvKeys.ENTER:
          if (this.viewIndex == ViewIndexes.PRODUCTS) {
            let product = this.products[this.view.productIndex];

            if (this.isSignedIn()) {
              if (this.consumer.subscription_count > 0 && product.ItemType == 4) {
                let args = {
                  title: "Warning",
                  message: "Subscription already purchased"
                };
                showSpinner();
                this.createController(DialogController, args, true);
              } else {
                this.purchaseSubscription(product);
              }
            } else {
              this.view.trigger("hide");
              this.createController(OAuthController, { isSignUp: true });
            }
          } else if (this.viewIndex == ViewIndexes.SIGN_IN && !this.isSignedIn()) {
            this.view.trigger("hide");
            this.createController(OAuthController, {});
          }
          break;
        case TvKeys.BACK:
        case TvKeys.RETURN:
          this.removeSelf();
          break;
        default:
          break;
      }
    };

    this.show = () => {
      this.viewIndex = ViewIndexes.PRODUCTS;
      this.view.trigger("show");
      let cb = () => {
        if (this.isSignedIn()) {
          this.view.updateEmail(this.consumer.email);
          this.view.showSignedIn();
        } else {
          this.consumer = null;
          this.view.showSignIn();
        }

        hideSpinner();
      };
      showSpinner();
      this.fetchConsumerThenCallback(cb);
    };

    this.hide = () => {
      this.view.trigger("hide");
    };

    this.close = () => {
      showSpinner();

      if (this.view) {
        this.view.close();
        this.view = null;
      }

      if (this.products.length == 0) {
        alert("Unable to connect to Samsung Checkout. Please try again later");
      }
    };

    /**
     * Handle network disconnect/reconnect
     */
    this.handleNetworkDisconnect = () => {};
    this.handleNetworkReconnect = () => {};

    this.enterBackgroundState = () => {};
    this.returnBackgroundState = () => {};

    this.registerHandler("loadComplete", this.show, this);
    this.registerHandler("buttonPress", this.handleButtonPress, this);
    this.registerHandler("show", this.show, this);
    this.registerHandler("hide", this.hide, this);
    this.registerHandler("close", this.close, this);
    this.registerHandler("networkDisconnect", this.handleNetworkDisconnect, this);
    this.registerHandler("networkReconnect", this.handleNetworkReconnect, this);
    this.registerHandler("enterBackgroundState", this.enterBackgroundState, this);
    this.registerHandler("returnBackgroundState", this.returnBackgroundState, this);
  };

  if (!exports.PurchaseController) { exports.PurchaseController = PurchaseController; };
})(window);
