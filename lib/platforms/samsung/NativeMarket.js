(function(exports){
  "use strict";

  var NativeMarket = function(){
    let _this = this;

    let webapisDefined = !(typeof webapis === "undefined");

    // requestProducts() requests the IAPs available for app
    //
    // Params:
    //   marketplaceSettings - object with marketplace settings(url, server env, secret key, app id)
    //   successCallback - function to call when request is successful
    //   errCallback - function to call when request fails
    this.requestProducts = (marketplaceSettings, successCallback, errCallback) => {
      try {
        let appId = marketplaceSettings.appId;
        let secret = marketplaceSettings.secret;
        let udid = this.getUdid();
        let countryCode = this.getCountryCode();

        let reqParams = appId + countryCode;
        let hash = CryptoJS.HmacSHA256(reqParams, secret);
        let checkValue = CryptoJS.enc.Base64.stringify(hash);

        let detailObj = new Object();
        detailObj.AppID = appId;
        detailObj.CustomID = udid;
        detailObj.CountryCode = countryCode;
        detailObj.CheckValue = checkValue;

        let requestProductsParams = JSON.stringify(detailObj);
        $.ajax({
          url: marketplaceSettings.url + "/cont/list",
          type: "POST",
          dataType: "JSON",
          data: requestProductsParams,
          timeout:10000,
          success: function(res) {
            console.log("success : " + JSON.stringify(res));
            successCallback(res)
          },
          error: function(jqXHR, ajaxOptions, thrownError, request, error) {
            console.log("[Error] thrownError:"+thrownError+";error:"+error+";[Message]:"+jqXHR.responseText);
            errCallback(jqXHR);
          },
          complete:function() {
            console.log("complete");
          },
          failure:function() {
            console.log("failure");
          }
        });
      } catch (error) { console.log(error); }
    };

    // requestUserPurchases() requests products user has purchased
    //
    // Params:
    //   marketplaceSettings - object with marketplace settings(url, server env, secret key, app id)
    //   successCallback - function to call when request is successful
    //   errCallback - function to call when request fails
    this.requestUserPurchases = (marketplaceSettings, successCallback, errCallback) => {
      try {
        let appId = marketplaceSettings.appId;
        let secret = marketplaceSettings.secret;
        let udid = this.getUdid();
        let countryCode = this.getCountryCode();
        let itemType = "2"; // request all product types
        let pageNum = 1;

        let reqParams = appId + udid + countryCode + itemType + pageNum;
        let hash = CryptoJS.HmacSHA256(reqParams, secret);
        let checkValue = CryptoJS.enc.Base64.stringify(hash);

        let detailObj = new Object();
        detailObj.AppID = appId;
        detailObj.CustomID = udid;
        detailObj.CountryCode = countryCode;
        detailObj.ItemType = itemType;
        detailObj.PageNumber = pageNum;
        detailObj.CheckValue = checkValue;

        let requestPurchasesParams = JSON.stringify(detailObj);
        $.ajax({
          url: marketplaceSettings.url + "/invoice/list",
          type: "POST",
          dataType: "JSON",
          data: requestPurchasesParams,
          timeout:10000,
          success: function(res) {
            console.log("success : " + JSON.stringify(res));
            successCallback(res)
          },
          error: function(jqXHR, ajaxOptions, thrownError, request, error) {
            console.log("[Error] thrownError:"+thrownError+";error:"+error+";[Message]:"+jqXHR.responseText);
            errCallback(jqXHR);
          },
          complete:function() {
            console.log("complete");
          },
          failure:function() {
            console.log("failure");
          }
        });
      } catch (error) { console.log(error); }
    };

    // findInvoice() looks through user invoices for invoice matching product id
    // - needed since Samsung Checkout doesn't return invoice ids in purchase response
    // - searches for the most recent invoice that matches product id
    //
    // Params:
    //   marketplaceSettings - object with marketplace settings(url, server env, secret key, app id)
    //   productId - string of product id to find invoice for
    //   successCallback - function to call when request is successful
    //   errCallback - function to call when request fails
    this.findInvoice = (marketplaceSettings, productId, successCallback, errCallback) => {
      let userPurchasesCallback = res => {
        if (res.CPStatus == "100000" && res.InvoiceDetails && res.InvoiceDetails.length > 0) {
          let invoice;

          let matchingInvoices = [];
          for (let i = 0; i < res.InvoiceDetails.length; i++) {
            if (res.InvoiceDetails[i].ItemID == productId) matchingInvoices.push(res.InvoiceDetails[i]);
          }
          for (let i = 0; i < matchingInvoices.length; i++) {
            if (invoice) {
              if (matchingInvoices[i].OrderTime > invoice.OrderTime) invoice = matchingInvoices[i];
            } else {
              invoice = matchingInvoices[i];
            }
          }

          successCallback(invoice);
        } else {
          errCallback(null)
        }
      };
      this.requestUserPurchases(marketplaceSettings, userPurchasesCallback, userPurchasesCallback);
    };

    // findProductById() looks through products for matching product id
    //
    // Params:
    //   marketplaceSettings - object with marketplace settings(url, server env, secret key, app id)
    //   productId - string of product id to find product for
    //   successCallback - function to call when request is successful
    //   errCallback - function to call when request fails
    this.findProductById = (marketplaceSettings, productId, successCallback, errCallback) => {
      let productsCallback = res => {
        if (res.CPStatus == "100000" && res.ItemDetails && res.ItemDetails.length > 0) {
          let product;
          for (let i = 0; i < res.ItemDetails.length; i++) {
            if (res.ItemDetails[i].ItemID == productId) product = res.ItemDetails[i];
          }

          successCallback(product);
        } else {
          errCallback(null)
        }
      };
      this.requestProducts(marketplaceSettings, productsCallback, productsCallback);
    };

    // verifyPurchase() requests products user has purchased
    //
    // Params:
    //   marketplaceSettings - object with marketplace settings(url, server env, secret key, app id)
    //   invoiceId - string of invoice id
    //   successCallback - function to call when request is successful
    //   errCallback - function to call when request fails
    this.verifyPurchase = (marketplaceSettings, invoiceId, successCallback, errCallback) => {
      try {
        let appId = marketplaceSettings.appId;
        let secret = marketplaceSettings.secret;
        let udid = this.getUdid();
        let countryCode = this.getCountryCode();

        let detailObj = new Object();
        detailObj.AppID = appId;
        detailObj.InvoiceID = invoiceId,
        detailObj.CustomID = udid;
        detailObj.CountryCode = countryCode;

        let requestPurchasesParams = JSON.stringify(detailObj);
        $.ajax({
          url: marketplaceSettings.url + "/invoice/verify",
          type: "POST",
          dataType: "JSON",
          data: requestPurchasesParams,
          timeout:10000,
          success: function(res) {
            console.log("success : " + JSON.stringify(res));
            successCallback(res)
          },
          error: function(jqXHR, ajaxOptions, thrownError, request, error) {
            console.log("[Error] thrownError:"+thrownError+";error:"+error+";[Message]:"+jqXHR.responseText);
            errCallback(jqXHR);
          },
          complete:function() {
            console.log("complete");
          },
          failure:function() {
            console.log("failure");
          }
        });
      } catch (error) { console.log(error); }
    };

    // applyProduct() applys the product for the user Samsung Checkout account
    // - used in cases of network disconnect
    //
    // Params:
    //   marketplaceSettings - object with marketplace settings(url, server env, secret key, app id)
    //   invoiceId - string of invoice id
    //   successCallback - function to call when request is successful
    //   errCallback - function to call when request fails
    this.applyPurchase = (marketplaceSettings, invoiceId, successCallback, errCallback) => {
      try {
        let appId = marketplaceSettings.appId;
        let secret = marketplaceSettings.secret;
        let udid = this.getUdid();
        let countryCode = this.getCountryCode();

        let detailObj = new Object();
        detailObj.AppID = appId;
        detailObj.InvoiceID = invoiceId,
        detailObj.CustomID = udid;
        detailObj.CountryCode = countryCode;

        let requestPurchasesParams = JSON.stringify(detailObj);
        $.ajax({
          url: marketplaceSettings.url + "/invoice/apply",
          type: "POST",
          dataType: "JSON",
          data: requestPurchasesParams,
          timeout:10000,
          success: function(res) {
            console.log("success : " + JSON.stringify(res));
            successCallback(res)
          },
          error: function(jqXHR, ajaxOptions, thrownError, request, error) {
            console.log("[Error] thrownError:"+thrownError+";error:"+error+";[Message]:"+jqXHR.responseText);
            errCallback(jqXHR);
          },
          complete:function() {
            console.log("complete");
          },
          failure:function() {
            console.log("failure");
          }
        });
      } catch (error) { console.log(error); }
    };

    // cancelSubscription() cancels the subscription
    //
    // Params:
    //   marketplaceSettings - object with marketplace settings(url, server env, secret key, app id)
    //   invoiceId - string of invoice id
    //   successCallback - function to call when request is successful
    //   errCallback - function to call when request fails
    this.cancelSubscription = (marketplaceSettings, invoiceId, successCallback, errCallback) => {
      try {
        let appId = marketplaceSettings.appId;
        let secret = marketplaceSettings.secret;
        let udid = this.getUdid();
        let countryCode = this.getCountryCode();

        let detailObj = new Object();
        detailObj.AppID = appId;
        detailObj.InvoiceID = invoiceId,
        detailObj.CustomID = udid;
        detailObj.CountryCode = countryCode;

        let cancelSubParams = JSON.stringify(detailObj);
        $.ajax({
          url: marketplaceSettings.url + "/subscription/cancel",
          type: "POST",
          dataType: "JSON",
          data: cancelSubParams,
          timeout:10000,
          success: function(res) {
            console.log("success : " + JSON.stringify(res));
            successCallback(res)
          },
          error: function(jqXHR, ajaxOptions, thrownError, request, error) {
            console.log("[Error] thrownError:"+thrownError+";error:"+error+";[Message]:"+jqXHR.responseText);
            errCallback(jqXHR);
          },
          complete:function() {
            console.log("complete");
          },
          failure:function() {
            console.log("failure");
          }
        });
      } catch (error) { console.log(error); }
    };

    // purchaseItem() purchases an item
    //
    // Params:
    //   marketplaceSettings - object with marketplace settings(url, server env, secret key, app id)
    //   purchaseItem - object of item to be purchased. obtained from requestProducts()
    //   successCallback - function to call when request is successful
    //   errCallback - function to call when request fails
    this.purchaseItem = (marketplaceSettings, purchaseItem, successCallback, errCallback) => {
      try {
        let appId = marketplaceSettings.appId;
        let serverType = marketplaceSettings.serverType;
        let udid = this.getUdid();

        let detailObj = new Object();
        detailObj.OrderItemID = purchaseItem.ItemID;
        detailObj.OrderTitle = purchaseItem.ItemTitle;
        detailObj.OrderTotal = purchaseItem.Price.toString();
        detailObj.OrderCurrencyID = purchaseItem.CurrencyID;
        detailObj.OrderCustomID = udid;

        let purchaseItemDetails = JSON.stringify(detailObj);
        webapis.billing.buyItem(appId, serverType, purchaseItemDetails,
          function(data) {
            console.log("success purchaseItem()");
            successCallback(data);
          },
          function(err) {
            console.log("error purchaseItem()");
            successCallback(err);
          }
        );
      } catch (error) { console.log(error); }
    };

    // callReceiptValidator() calls receipt validator to validate transaction
    //
    // Params:
    //   transactionInfo - object with Zype related transaction info (app, site, consumer, subscription plan)
    //   receipt - object of invoice for purchase (Samsung app id, invoice id, custom id/udid, country code, trial period)
    //   successCallback - function to call when request is successful
    //   errCallback - function to call when request fails
    this.callReceiptValidator = (transactionInfo, receipt, successCallback, errCallback) => {
      let validatorEndpoint = "https://mkt.zype.com/v1/tizen/"; // prod
      // let validatorEndpoint = "https://mkt.stg.zype.com/v1/tizen/"; // staging

      let validationData = {
        "app_id": transactionInfo.app_id,
        "site_id": transactionInfo.site_id,
        "consumer_id": transactionInfo.consumer_id,
        "plan_id": transactionInfo.plan_id,
        "receipt": {
          "AppID": receipt.AppID,
          "InvoiceID": receipt.InvoiceID,
          "CustomID": receipt.CustomID,
          "CountryCode": receipt.CountryCode,
          "freeTrialDayCount": receipt.freeTrialDayCount
        }
      };
      let validatorParams = JSON.stringify(validationData);

      console.log("POST " + validatorEndpoint + "\n" + validatorParams);
      $.ajax({
        url: validatorEndpoint,
        type: "POST",
        contentType: "application/json",
        data: validatorParams,
        timeout:10000,
        success: function(res) {
          console.log("success : " + JSON.stringify(res));
          successCallback(res)
        },
        error: function(jqXHR, ajaxOptions, thrownError, request, error) {
          console.log("[Error] thrownError:"+thrownError+";error:"+error+";[Message]:"+jqXHR.responseText);
          errCallback(jqXHR);
        },
        complete:function() {
          console.log("complete");
        },
        failure:function() {
          console.log("failure");
        }
      });
    };

    // purchaseAndGetInvoice() purchase an item then find the invoice
    //
    // Params:
    //   marketplaceSettings - object with marketplace settings(url, server env, secret key, app id)
    //   purchaseItem - object of item to be purchased. obtained from requestProducts()
    //   successCallback - function to call when request is successful
    //   errCallback - function to call when request fails
    this.purchaseAndGetInvoice = (marketplaceSettings, purchaseItem, successCallback, errCallback) => {
      try {
        let fetchInvoiceCallback = purchaseResult => {
          let paymentDetails = JSON.parse(purchaseResult.payDetail);
          let productId = paymentDetails.OrderItemID || purchaseItem.ItemID;

          let invoiceFoundCallback = invoice => {
            successCallback(invoice);
          };
          let invoiceMissingCallback = err => {
            errCallback(null)
          };

          this.findInvoice(marketplaceSettings, productId, invoiceFoundCallback, invoiceMissingCallback);
        };

        // if purchase succeeds, find invoice and returning invoice or null
        this.purchaseItem(marketplaceSettings, purchaseItem, fetchInvoiceCallback, errCallback);

      } catch(error) {console.log(error)}
    };

    this.getCountryCode = () => {
      return webapis.productinfo.getSystemConfig(webapis.productinfo.ProductInfoConfigKey.CONFIG_KEY_SERVICE_COUNTRY);
    };

    this.getUdid = () => {
      return webapis.sso.getLoginUid();
    };

  }; // end of NativeMarket

  exports.NativeMarket = new NativeMarket();
})(window);