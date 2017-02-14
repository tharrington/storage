angular.module('fencesForBusiness.invoice_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('InvoiceCtrl', function($scope, $ionicPopup, $ionicLoading, $interval, $localStorage, $rootScope, $state, fencesData, $stateParams, InvoiceService, ImageService, $cordovaCamera) {
  $scope.invoice = {};
  $scope.order = {};
  $scope.products = [];
  $scope.total_count = 0, $scope.shipping_count = 0;

  function handleResult(invoice, products) {
    products.forEach(function(entry) {
      entry.invoice_count = 0;
    });
    
    invoice.items.forEach(function(item) {
      products.forEach(function(product) {
        if(product.name == item.product_name && item.type != 'Service Fees') {
          product.invoice_count = item.quantity;
          $scope.total_count += item.quantity;
        }
      });
    });

  }

  function getInvoice() {
    fencesData.callWrapper('/invoices/bySSOrderId/' + $stateParams.id, 'GET', null).then(function(result) {
      if(result && result.products) {
        handleResult(result.invoice, result.products);

        $scope.products = result.products;
        $scope.order = result.order;
        $scope.invoice = result.invoice;
        InvoiceService.setInvoice(result.invoice);
        InvoiceService.setProducts(result.products);
        InvoiceService.setOrder(result.order);
      }
    });
  }
  
  $scope.$on( "$ionicView.enter", function( scopes ) {
    var inv = InvoiceService.getInvoice(); 
    $scope.total_count = 0;
    if(inv == null || inv._id == null || inv.order_id != $stateParams.id ) {
      getInvoice();
    } else {
      $scope.products = InvoiceService.getProducts(); 
      $scope.order = InvoiceService.getOrder(); 
      handleResult(inv, $scope.products);
      $scope.invoice = inv;
    }
  });

  /**
   * Take photos for shipping and save them to the order
   */
  $scope.takeShippingPhoto = function() {
    var options = {
      quality: 100,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: true,
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

    if($scope.shipping_count > 0 && ($scope.order.shippingImageURLs == null || $scope.order.shippingImageURLs == '')) {
      var alertPopup = $ionicPopup.alert({
         title: 'Please add shipping photos.',
         template: 'Please take a photo of all the items for shipment.'
      });

      alertPopup.then(function(res) {});
      return;
    }

    if($scope.total_count == 0) {
      var alertPopup = $ionicPopup.alert({
         title: 'You need to add some items!',
         template: 'Hey dipshit, is this customer really storing nothing?'
      });

      alertPopup.then(function(res) {});
      return;
    }
    var items = [];
    $scope.products.forEach(function(entry) {
      if(entry.invoice_count > 0) {
        items.push({
          product_id : entry.externalId,
          type: "Storage Goods",
          item_price : entry.price,
          total_price: entry.price,
          quantity : entry.invoice_count,
          product_name : entry.name
        });
      }
    });
    $scope.invoice.items = items;
    InvoiceService.setInvoice($scope.invoice);
    $state.go('app.finalize_invoice', { id : $scope.invoice._id });
  };

  $scope.incrementProduct = function(index, value) {
  	if($scope.products[index].invoice_count > 0 || value == 1) {
	  	$scope.products[index].invoice_count = $scope.products[index].invoice_count + value; 
  		$scope.total_count += value;
  	}
  }

  $scope.incrementShipping = function(value) {
    if($scope.shipping_count > 0 || value == 1) {
      $scope.shipping_count = $scope.shipping_count + value; 
    }
  }

});
