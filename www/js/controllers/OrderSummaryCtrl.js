angular.module('fencesForBusiness.order_summary_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('OrderSummaryCtrl', function($scope, OrderInvoiceService, $ionicLoading, $state, fencesData, $stateParams) {
  $scope.$on( "$ionicView.enter", function( scopes ) {

  	$scope.pickup = {};
  	$scope.delivery = {};
  	$scope.invoice = {};
    $scope.shipping_invoice = {};

    $scope.total_invoice_items = 0;
    $scope.total_shipping_items = 0;
  	$ionicLoading.show({ template: 'Loading Order...' });

  	fencesData.callWrapper('/invoices/getOrderAndInvoice/' + $stateParams.id, 'GET', null)
	    .then(function(result) {
        console.log('### got result: ' + JSON.stringify(result));

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
                images.push(item);
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
            total_items = total_items + item.quantity;
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
    fencesData.callWrapper('/orders/' + $scope.pickup._id, 'PUT', $scope.pickup)
      .then(function(result) {
        $ionicLoading.show({ template: 'Order Saved.', duration: 1000 });
      });
  }

  $scope.editInvoice = function(invoice) {
  	$state.go('app.invoice', { id : $stateParams.id });
  }
});
