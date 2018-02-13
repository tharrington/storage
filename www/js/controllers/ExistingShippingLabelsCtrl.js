angular.module('fencesForBusiness.existing_shipping_labels_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('ExistingShippingLabelsCtrl', function($scope, OrderInvoiceService, $ionicLoading, $state, fencesData, $stateParams, $rootScope) {
  

  $scope.$on( "$ionicView.leave", function( scopes ) {
  });

  $scope.$on( "$ionicView.enter", function( scopes ) {
  	$scope.pickup = {};
    $scope.shipping_invoice = {};
    $scope.total_invoice_items = 0;
    $scope.total_shipping_items = 0;
    $scope.shipment = OrderInvoiceService.shipment;

    // TODO remove this once real data is setup
    $scope.dimensions = [
      { length: 10, width: 20, height: 30, weight: 100, },
      { length: 42, width: 35, height: 8, weight: 9, },
    ];
    $scope.labelsEmail = null;

  	$ionicLoading.show({ template: 'Loading Order...' });

    var formatAddress = function(name, street1, street2, city, state, zip) {
      return `${name}, ${street1}, ${street2 ? street2 + ',' : ''} ${city}, ${state} ${zip}`
    };

  	fencesData.callWrapper('/invoices/getOrderAndInvoice/' + $stateParams.id, 'GET', null)
	    .then(function(result) {
	      $ionicLoading.hide();
	      $scope.pickup = result.Pickup;
        $scope.shippingDescription = result.Delivery.shippingDescription;
        $scope.shippingAddress = {
          name:    result.Delivery.shippingAddressName,
          street1: result.Delivery.shippingAddressStreet1,
          street2: result.Delivery.shippingAddressStreet2,
          city:    result.Delivery.shippingAddressCity,
          state:   result.Delivery.shippingAddressState,
          zip:     result.Delivery.shippingAddressZip,
        }
        $scope.shippingAddressPretty = formatAddress(
          result.Delivery.shippingAddressName,
          result.Delivery.shippingAddressStreet1,
          result.Delivery.shippingAddressStreet2,
          result.Delivery.shippingAddressCity,
          result.Delivery.shippingAddressState,
          result.Delivery.shippingAddressZip,
        );
        $scope.shippingTrackingNumber = result.Delivery.shippingTrackingNumber;

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

  $scope.resendLabels = function() {
    console.log('resendLabels called');
    // TODO resend labels to warehouseman email
  }

  $scope.voidLabels = function() {
    console.log('voidLabels called');
    // TODO void shipping label (with UPS) otherwise still get billed
  }

  $scope.formatDate = function(date) {
  	return moment(date).format('dddd, MMMM Do, YYYY');
  }
});
