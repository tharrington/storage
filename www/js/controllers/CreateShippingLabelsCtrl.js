angular.module('fencesForBusiness.create_shipping_labels_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('CreateShippingLabelsCtrl', function($scope, OrderInvoiceService, $ionicLoading, $state, fencesData, $stateParams) {
  

  $scope.$on( "$ionicView.leave", function( scopes ) {
  });

  $scope.$on( "$ionicView.enter", function( scopes ) {
  	$scope.pickup = {};
    $scope.shipping_invoice = {};
    $scope.total_invoice_items = 0;
    $scope.total_shipping_items = 0;

    $scope.dimensions = [];
    $scope.labelsEmail = null;

  	$ionicLoading.show({ template: 'Loading Order...' });

  	fencesData.callWrapper('/invoices/getOrderAndInvoice/' + $stateParams.id, 'GET', null)
	    .then(function(result) {
	      $ionicLoading.hide();
	      $scope.pickup = result.Pickup;

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
              console.log('shipping_invoice', inv);
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
            console.log('### item : ' + JSON.stringify(item));
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

  $scope.addMegaBox = function() {
    $scope.dimensions.push({
      length: 24,
      width: 18,
      height: 16,
      weight: null,
    });
  }

  $scope.addOtherItem = function() {
    $scope.dimensions.push({});
  }

  $scope.deleteItem = function(index) {
    $scope.dimensions.splice(index, 1);
  }

  $scope.processLabels = function() {
    $ionicLoading.show({ template: 'Saving' });
    console.log('$scope.ship_item_dimension.length', $scope.ship_item_dimension.length);

    // TODO: call EasyPost and get parameterized url for shipping label
    // TODO: save EasyPost url to invoice
    // fencesData.callWrapper('/orders/' + $scope.pickup._id, 'PUT', $scope.pickup)
    //   .then(function(result) {
    //     $ionicLoading.show({ template: 'Order Saved.', duration: 1000 });
    //   });
  }
});
