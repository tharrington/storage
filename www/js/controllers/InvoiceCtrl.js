angular.module('fencesForBusiness.invoice_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('InvoiceCtrl', function($scope, $ionicNavBarDelegate, $ionicScrollDelegate, $ionicPopup, $ionicLoading, $interval, $localStorage, $rootScope, $state, fencesData, $stateParams, InvoiceService, ImageService, $cordovaCamera) {
  $scope.invoice = {};
  $scope.order = {};
  $scope.products = [];
  $scope.all_products = [];
  $scope.added_services = [];
  $scope.total_count = 0, $scope.shipping_count = 0, $scope.added_services_count = 0;
  var miscIndex;
  $scope.show_shipping = false;
  $scope.show_shipping_message = false;
  $scope.show_storage = true;
  $scope.show_additional = false;
  $scope.shipping_info_text = '';

  function handleResult(invoice, products) {

    products.forEach(function(entry) {
      entry.invoice_count = 0;
    });
    $scope.products = [];
    $scope.added_services = [];
    
    if(invoice && invoice.items) {
      products.forEach(function(product) {
        if(product.name.indexOf('Mattress Bag') != 0 && 
          product.name.indexOf('Overweight Box') != 0 && 
          product.name.indexOf('Room Service') != 0 && 
          product.name.indexOf('Last Minute Room Service') != 0 && 
          product.name.indexOf('Moving Blanket') != 0 && 
          product.name.indexOf('Declared Value') != 0) {
          $scope.products.push(product);
        } else {
          $scope.added_services.push(product);
        }

        invoice.items.forEach(function(item) {
          if(!item.misc_notes) {
            item.misc_notes = '';
          }

          if(product.name == item.product_name && item.type != 'Service Fees') {
            product.invoice_count = item.quantity;

            if(product.name.indexOf('Mattress Bag') != 0 && 
              product.name.indexOf('Overweight Box') != 0 && 
              product.name.indexOf('Room Service') != 0 && 
              product.name.indexOf('Last Minute Room Service') != 0 && 
              product.name.indexOf('Moving Blanket') != 0 && 
              product.name.indexOf('Declared Value') != 0) {
              $scope.total_count += item.quantity;
            } else {
              $scope.added_services_count += item.quantity;
            }
          }
        }); 
      });
    } else {
      $ionicLoading.show({template : 'There was an error. Contact your manager.', duration: 1500});
    }
  }

  function getInvoice() {
    console.log('### getting info...');
    fencesData.callWrapper('/invoices/bySSOrderId/' + $stateParams.id, 'GET', null).then(function(result) {    
      console.log('### got result: ' + JSON.stringify(result));  
      if(result && result.products) {

        if(!InvoiceService.getInvoice()._id) {
          $scope.invoice = result.invoice;
        } else {
          $scope.invoice = InvoiceService.getInvoice();
        }
        console.log('### got invoice: ' + JSON.stringify($scope.invoice))
        handleResult($scope.invoice, result.products);

        $scope.all_products = result.products;
        $scope.order = result.order;

        if(!$scope.order.megaboxShippingUnits) {
          $scope.order.megaboxShippingUnits = 0;
        }
        if(!$scope.order.binShippingUnits) {
          $scope.order.binShippingUnits = 0;
        }
        if(!$scope.order.boxShippingUnits) {
          $scope.order.boxShippingUnits = 0;
        }
        if(!$scope.order.bagShippingUnits) {
          $scope.order.bagShippingUnits = 0;
        }
        if(!$scope.order.luggageShippingUnits) {
          $scope.order.luggageShippingUnits = 0;
        }
        if(!$scope.order.trunkShippingUnits) {
          $scope.order.trunkShippingUnits = 0;
        }

        // do shipping calculation
        var pickupMoment = moment($scope.order.deliveryDate);
        var shippingMoment = moment($scope.order.shippingDate);
        var duration = moment.duration(shippingMoment.diff(pickupMoment));
        var days = duration.asDays();

        if($scope.order.Shipping_All_or_Some == 'All' && days < 21) {
          $scope.shipping_info_text = 'Confirm customer wishes to ship their entire order and not store anything. Enter all of the customer’s items under Shipping Section ONLY.';
          $scope.show_storage = false;
          $scope.show_shipping = true;
        } else if($scope.order.Shipping_All_or_Some == 'All' && days >= 21) {
          $scope.shipping_info_text = 'Confirm customer wishes to ship their entire order at a later date. Enter all items under the Storage Section ONLY, not under the Shipping Section. Each item should have a storage and shipping label with identical item count.';
          $scope.show_storage = true;
          $scope.show_shipping = false;
          $scope.show_shipping_message = true;
        } else if($scope.order.Shipping_All_or_Some != 'All' && days < 21) {
          $scope.shipping_info_text = 'Confirm customer wishes to ship some of their items ASAP and store the rest. Enter ONLY shipping items into Shipping Section. Enter ONLY storage items into Storage Section. Storage and shipping labels should have separate item counts.';
          $scope.show_storage = true;
          $scope.show_shipping = true;
        } else if($scope.order.Shipping_All_or_Some != 'All' && days >= 21) {
          $scope.shipping_info_text = 'Customer wishes to store ALL items and ship SOME at a later date. Enter ONLY shipping items under Shipping Section. Enter ALL items under Storage Section. Storage and shipping labels should have separate item count.';
          $scope.show_storage = true;
          $scope.show_shipping = true;
        }

        if(!$scope.order.Shipping_All_or_Some) {
          $scope.show_storage = true;
          $scope.show_shipping = false;
        }

        $scope.shipping_count = $scope.order.shippingUnits;

        InvoiceService.setInvoice($scope.invoice);

        InvoiceService.setProducts(result.products);
        InvoiceService.setOrder(result.order);

        $ionicScrollDelegate.resize();
      }
    });
  }
  
  $scope.$on( "$ionicView.enter", function( scopes ) {
    $ionicNavBarDelegate.showBackButton(true);
    
    $scope.invoice = {};
    $scope.order = {};
    $scope.products = [];
    $scope.all_products = [];
    $scope.added_services = [];
    
    $scope.total_count = 0;

    getInvoice();
  });

  /**
   * Take photos for shipping and save them to the order
   */
  $scope.takeShippingPhoto = function() {
    var options = { 
      quality: 80,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: false,
      encodingType: Camera.EncodingType.JPEG, 
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false
    };

    $cordovaCamera.getPicture(options).then(function(imageData) {
        ImageService.uploadImage(imageData).then(function(response) {
          $scope.order.shippingImageURLs = response.url;
          $scope.order.shippingUnits = $scope.shipping_count;
          fencesData.postInfo('/orders/' + $scope.order._id, 'PUT', $scope.order).then(function(result) {
            $ionicLoading.show({template : 'Order Saved', duration: 500});
          });
        });
    }, function(err) {
        // error
        console.log(err);
    });
  }

  /** 
   * Do validation and move on to the shipping page
   */
  $scope.takeImages = function() {
    if($scope.total_count == 0 && $scope.shipping_count == 0){
      var alertPopup = $ionicPopup.alert({
         title: 'Must ship or store something',
         template: 'Please add items to ship or store.'
      });

      alertPopup.then(function(res) {});
      return;
    }

    if($scope.shipping_count > 0 && ($scope.order.shippingImageURLs == null || $scope.order.shippingImageURLs == '')) {
      var alertPopup = $ionicPopup.alert({
         title: 'Please add shipping photos.',
         template: 'Please take a photo of all the items for shipment.'
      });

      alertPopup.then(function(res) {});
      return;
    }
  
    if(miscIndex != null && $scope.all_products[miscIndex].notes != null && $scope.all_products[miscIndex].notes.trim().length == 0){
      var alertPopup = $ionicPopup.alert({
         title: 'Add miscellaneous notes.',
         template: 'Please describe miscellaneous and furniture items.'
      });

      alertPopup.then(function(res) {});
      return;
    }

    if($scope.total_count == 0 ) {
      var confirmPopup = $ionicPopup.confirm({
         title: 'Not Storing anything?',
         template: 'Are you sure you want to submit the invoice without any storage items or images?  This can only be done for customers shipping all of their items IMMEDIATELY after pickup'
      });

      confirmPopup.then(function(res) {
        if(res) createInvoice();
      });
    }
    else {
      createInvoice();
    }
  }

  /**
   * create invoice helper
   */
  function createInvoice(){
    var items = [];
      console.log("### type: " + JSON.stringify($scope.all_products));
      $scope.all_products.forEach(function(entry) {
        if(entry.invoice_count > 0 && (entry.name != 'Miscellaneous' || entry.name != 'Furniture')) {
          items.push({
            product_id : entry.externalId,
            type: "Storage Goods",
            item_price : entry.price,
            total_price: entry.price,
            quantity : entry.invoice_count,
            product_name : entry.name,
            misc_notes : entry.misc_notes
          });
        } else if(entry.invoice_count > 0 && (entry.name == 'Miscellaneous' || entry.name == 'Furniture')){
          items.push({
            product_id : entry.externalId, 
            type: "Storage Goods",
            item_price : entry.price,
            total_price: entry.price,
            quantity : entry.invoice_count,
            product_name : entry.name,
            misc_notes : entry.misc_notes
          });
        }
      });
      $scope.invoice.items = items;
      InvoiceService.setInvoice($scope.invoice);
      $state.go('app.finalize_invoice', { id : $scope.invoice._id });
  }


  /**
   * increment product
   */
  $scope.incrementProduct = function(index, value) {
    var product = $scope.products[index];

    if(product.invoice_count > 0 || value == 1) {
      product.invoice_count = product.invoice_count + value; 
      $scope.total_count += value;
    }

    if(product.invoice_count == 0 && product.name == "Miscellaneous"){
      product.notes = null;
      miscIndex = null;
    }

    if(product.name == 'Miscellaneous' && product.invoice_count > 0){
      miscIndex = index;
    }
  }

  /**
   * increment product
   */
  $scope.increment_added_services = function(index, value) {
    var product = $scope.added_services[index];
    if(product.invoice_count > 0 || value == 1) {
      product.invoice_count = product.invoice_count + value; 
      $scope.added_services_count += value;
    }
  }


  // $scope.incrementShipping = function(value, key) {
  //   if($scope.shipping_count > 0 || value == 1) {
  //     $scope.shipping_count = $scope.shipping_count + value; 
  //     $scope.order.shippingUnits = $scope.shipping_count;

  //     fencesData.postInfo('/orders/' + $scope.order._id, 'PUT', $scope.order).then(function(result) {
  //     });
  //   }
  //   console.log('### shipping: ' + $scope.order.shippingUnits);
  // }

  $scope.incrementShipping = function(value, key) {
    if($scope.order[key] > 0 || value == 1) {
      $scope.order[key] = $scope.order[key] + value; 
      $scope.shipping_count = $scope.shipping_count + value;
      $scope.order.shippingUnits = $scope.shipping_count;
      console.log('### saving order: ' + JSON.stringify($scope.order));
      fencesData.postInfo('/orders/' + $scope.order._id, 'PUT', $scope.order).then(function(result) {
      });
    }

  }

  $scope.toggleShipping = function() {
    $scope.show_shipping = !$scope.show_shipping;
    $ionicScrollDelegate.resize();
  };

  $scope.toggleStorage = function() {
    $scope.show_storage = !$scope.show_storage;
    $ionicScrollDelegate.resize();
  };

  $scope.toggleAdditional = function() {
    $scope.show_additional = !$scope.show_additional;
    $ionicScrollDelegate.resize();
  };


});
