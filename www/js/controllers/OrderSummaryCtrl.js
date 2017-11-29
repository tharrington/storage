angular.module('fencesForBusiness.order_summary_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('OrderSummaryCtrl', function($scope, OrderInvoiceService, $ionicLoading, $state, fencesData, $stateParams) {
  
  $scope.invoice = { imageURLs : [] };

  $scope.$on( "$ionicView.leave", function( scopes ) {
    console.log('### leaving summary');

    $scope.pickup.warehouseNotes = $scope.delivery.warehouseNotes;
    $scope.pickup.warehouseLocation = $scope.delivery.warehouseLocation;
    fencesData.callWrapper('/orders/' + $scope.pickup._id, 'PUT', $scope.pickup)
      .then(function(result) {
      });
    fencesData.callWrapper('/orders/' + $scope.delivery._id, 'PUT', $scope.delivery)
      .then(function(result) {
      });
  });

  $scope.$on( "$ionicView.enter", function( scopes ) {
    console.log('### order summary...');

  	$scope.pickup = {};
  	$scope.delivery = {};
  	$scope.invoice = { imageURLs : [] };


    $scope.shipping_invoice = {};

    $scope.total_invoice_items = 0;
    $scope.total_shipping_items = 0;
  	$ionicLoading.show({ template: 'Loading Order...' });

  	fencesData.callWrapper('/invoices/getOrderAndInvoice/' + $stateParams.id, 'GET', null)
	    .then(function(result) {
	      $ionicLoading.hide();
	      $scope.pickup = result.Pickup;
		  	$scope.delivery = result.Delivery;

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

  $scope.formatDate = function(date) {
  	return moment(date).format('dddd, MMMM Do, YYYY');
  }

  $scope.saveNotes = function() {
    $ionicLoading.show({ template: 'Saving' });
    $scope.pickup.warehouseNotes = $scope.delivery.warehouseNotes;
    $scope.pickup.warehouseLocation = $scope.delivery.warehouseLocation;
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
});
