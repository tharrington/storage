angular.module('fencesForBusiness.invoice_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('InvoiceCtrl', function($scope, $ionicNavBarDelegate, $ionicPopup, $ionicLoading, $interval, $localStorage, $rootScope, $state, fencesData, $stateParams, InvoiceService, ImageService, $cordovaCamera) {
  $scope.invoice = {};
  $scope.order = {};
  $scope.products = [];
  $scope.all_products = [];
  $scope.added_services = [];
  $scope.total_count = 0, $scope.shipping_count = 0, $scope.added_services_count = 0;
  var miscIndex;

  function handleResult(invoice, products) {
    products.forEach(function(entry) {
      entry.invoice_count = 0;
    });
    
    if(invoice && invoice.items) {
      products.forEach(function(product) {
        if(product.name.indexOf('Mattress Bag') != 0 && 
          product.name.indexOf('Overweight Box') != 0 && 
          product.name.indexOf('Room Service') != 0 && 
          product.name.indexOf('Moving Blanket') != 0 && 
          product.name.indexOf('Declared Value') != 0) {
          $scope.products.push(product);
        } else {
          $scope.added_services.push(product);
        }

        invoice.items.forEach(function(item) {
          if(product.name == item.product_name && item.type != 'Service Fees') {
            product.invoice_count = item.quantity;

            if(product.name.indexOf('Mattress Bag') != 0 && 
              product.name.indexOf('Overweight Box') != 0 && 
              product.name.indexOf('Room Service') != 0 && 
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
    console.log('### getting invoice: ' + $stateParams.id);
    fencesData.callWrapper('/invoices/bySSOrderId/' + $stateParams.id, 'GET', null).then(function(result) {      
      if(result && result.products) {
        handleResult(result.invoice, result.products);

        $scope.all_products = result.products;
        $scope.order = result.order;

        $scope.shipping_count = $scope.order.shippingUnits;
        $scope.invoice = result.invoice;
        InvoiceService.setInvoice(result.invoice);
        InvoiceService.setProducts(result.products);
        InvoiceService.setOrder(result.order);
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
    
    var inv = InvoiceService.getInvoice(); 
    $scope.total_count = 0;
    if(inv == null || inv._id == null || inv.order_id != $stateParams.id ) {
      getInvoice();
    } else {
      $scope.all_products = InvoiceService.getProducts(); 
      $scope.order = InvoiceService.getOrder(); 
      handleResult(inv, $scope.all_products);
      $scope.invoice = inv;
    }
  });

  /**
   * Take photos for shipping and save them to the order
   */
  $scope.takeShippingPhoto = function() {
    var options = {
      quality: 50,
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
      $scope.all_products.forEach(function(entry) {
        if(entry.invoice_count > 0 && (entry.name != 'Miscellaneous' || entry.name != 'Furniture')) {
          items.push({
            product_id : entry.externalId,
            type: "Storage Goods",
            item_price : entry.price,
            total_price: entry.price,
            quantity : entry.invoice_count,
            product_name : entry.name
          });
        }
        else if(entry.invoice_count > 0 && (entry.name == 'Miscellaneous' || entry.name == 'Furniture')){
          items.push({
            product_id : entry.externalId,
            type: "Storage Goods",
            item_price : entry.price,
            total_price: entry.price,
            quantity : entry.invoice_count,
            product_name : entry.name,
            misc_notes : entry.notes
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

  $scope.incrementShipping = function(value) {
    if($scope.shipping_count > 0 || value == 1) {
      $scope.shipping_count = $scope.shipping_count + value; 
      $scope.order.shippingUnits = $scope.shipping_count;
    }
  }

});
