angular.module('fencesForBusiness.order_summary_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('OrderSummaryCtrl', function($scope, OrderInvoiceService, $ionicLoading, $state, fencesData, $stateParams, $ionicModal) {

  $scope.invoice = { imageURLs : [] };
  $scope.modal = null;
  $scope.selectedImageURL = null;

  $scope.$on( "$ionicView.leave", function( scopes ) {
    if($scope.delivery && $scope.pickup && $scope.delivery.warehouseLocation && !$scope.pickup.warehouseLocation) {
      $scope.pickup.warehouseNotes = $scope.delivery.warehouseNotes;
      $scope.pickup.warehouseLocation = $scope.delivery.warehouseLocation;
    }

    fencesData.callWrapper('/orders/' + $scope.pickup._id, 'PUT', $scope.pickup)
      .then(function(result) {
      });
    fencesData.callWrapper('/orders/' + $scope.delivery._id, 'PUT', $scope.delivery)
      .then(function(result) {
      });
  });

  $scope.$on( "$ionicView.enter", function( scopes ) {

  	$scope.pickup = {};
  	$scope.delivery = {};
  	$scope.invoice = { imageURLs : [] };


    $scope.shipping_invoice = {};

    $scope.total_invoice_items = 0;
    $scope.total_shipping_items = 0;
  	$ionicLoading.show({ template: 'Loading Order...' });

    $scope.fromWarehouse = $stateParams.fromWarehouse;

  	fencesData.callWrapper('/invoices/getOrderAndInvoice/' + $stateParams.id, 'GET', null)
	    .then(function(result) {
	      $ionicLoading.hide();
	      $scope.pickup = result.Pickup;
		  	$scope.delivery = result.Delivery;

        if($scope.delivery && $scope.pickup && $scope.delivery.warehouseLocation && !$scope.pickup.warehouseLocation) {
          $scope.pickup.warehouseNotes = $scope.delivery.warehouseNotes;
          $scope.pickup.warehouseLocation = $scope.delivery.warehouseLocation;
        }

        if(result.invoices && result.invoices.length > 0) {
          var items = [];
          var images = [];

          result.invoices.forEach(function(inv) {
            if(inv.invoice_type == 'Storage Goods') {

              inv.items.forEach(function(item) {
                if(item.type == 'Storage Goods') {
                  items.push(item);
                }
              });

              inv.imageURLs.forEach(function(item) {
                images.push({ src : item });
                // images.push(item);
              });

              $scope.invoice = inv;
              $scope.invoice.imageURLs = images;
              $scope.invoice.items = items;
            } else if(inv.invoice_type == 'Shipping') {
              $scope.shipping_invoice = inv;
            }
          });


          if($scope.shipping_invoice && $scope.shipping_invoice._id) {
            var total_shipping_items = 0;
            $scope.shipping_invoice.items.forEach(function(item) {
              total_shipping_items = total_shipping_items + item.quantity;
            });
            $scope.total_shipping_items = total_shipping_items;
          }


          var total_items = 0;
          $scope.invoice.items.forEach(function(item) {
            if(item.type == 'Storage Goods') {
              total_items = total_items + item.quantity;
            }
          });
          $scope.total_invoice_items = total_items;
        }
	    }, function(err) {
	    	$ionicLoading.show({ template: 'There was an error', duration: 1000 });
	    });

  });

  $scope.formatDate = function(date) {
  	return moment(date).format('dddd, MMMM Do, YYYY');
  }

  $scope.saveNotes = function() {
    $ionicLoading.show({ template: 'Saving' });

    if($scope.delivery.warehouseLocation && !$scope.pickup.warehouseLocation) {
      $scope.pickup.warehouseNotes = $scope.delivery.warehouseNotes;
      $scope.pickup.warehouseLocation = $scope.delivery.warehouseLocation;
    } else if($scope.pickup.warehouseLocation) {
      $scope.delivery.warehouseNotes = $scope.pickup.warehouseNotes;
      $scope.delivery.warehouseLocation = $scope.pickup.warehouseLocation;
    }

    fencesData.callWrapper('/orders/' + $scope.pickup._id, 'PUT', $scope.pickup)
      .then(function(result) {
        $ionicLoading.show({ template: 'Order Saved.', duration: 1000 });
      });
    fencesData.callWrapper('/orders/' + $scope.delivery._id, 'PUT', $scope.delivery)
      .then(function(result) {
        $ionicLoading.show({ template: 'Order Saved.', duration: 1000 });
      });
  }

  $scope.editInvoice = function(invoice) {
  	$state.go('app.invoice', { id : $stateParams.id });
  }

  $scope.createLabels = function() {
    if ($scope.delivery.shippingEasyPostIds && $scope.delivery.shippingEasyPostIds != null) {
      $state.go('app.existing_shipping_labels', { id : $stateParams.id });
    } else {
      $state.go('app.create_shipping_labels', { id : $stateParams.id });
    }
  }

  $scope.imageClicked = function(imageURL) {
    $scope.selectedImageURL = imageURL;
    $scope.openModal();
  }

  $scope.deleteImage = function() {
    console.log('$scope', $scope);
    var externalInvoiceId = $scope.invoice.externalId;
    var newImageURLs = $scope.invoice.imageURLs.filter(function(url) {
      return url.src !== $scope.selectedImageURL;
    }).map(function(obj) {
      return obj.src;
    });
    var payload = { imageURLs: newImageURLs };

    fencesData.callWrapper(`/invoices/${externalInvoiceId}`, 'PATCH', payload)
      .then(function(updatedInvoice) {
        $scope.invoice.imageURLs = updatedInvoice.imageURLs.map(function(url) {
          return { src: url };
        });
        $scope.selectedImageURL = null;
        $scope.closeModal();
      });
  }

  $ionicModal.fromTemplateUrl('templates/delete_image_modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.openModal = function() {
     $scope.modal.show();
  };

  $scope.closeModal = function() {
     $scope.modal.hide();
    $scope.selectedImageURL = null;
  };

  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
     $scope.modal.remove();
    $scope.selectedImageURL = null;
  });

  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
     // Execute action
    $scope.selectedImageURL = null;
  });

  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
     // Execute action
    $scope.selectedImageURL = null;
  });


  $scope.lostItems = function() {
    $state.go('app.lost_items', { id : $scope.pickup.ssOrderId });
  }

  $scope.damagedItems = function() {
    $state.go('app.damaged_items', { id : $scope.pickup.ssOrderId });
  }
});
