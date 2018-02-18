angular.module('fencesForBusiness.existing_shipping_labels_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('ExistingShippingLabelsCtrl', function($scope, OrderInvoiceService, $ionicLoading, $state, fencesData, $stateParams, $rootScope) {
  

  $scope.$on( "$ionicView.leave", function( scopes ) {
  });

  $scope.$on( "$ionicView.enter", function( scopes ) {
  	$scope.pickup = {};
    $scope.shipping_invoice = {};
    $scope.total_invoice_items = 0;
    $scope.total_shipping_items = 0;
    $scope.hasErrors = false;
    $scope.errorMessage = '';

    // TODO remove this once real data is setup
    $scope.shippingInputs = { labelsEmail: null }

  	$ionicLoading.show({ template: 'Loading Order...' });

    var formatAddress = function(name, street1, street2, city, state, zip) {
      return `${name}, ${street1}, ${street2 ? street2 + ',' : ''} ${city}, ${state} ${zip}`
    };

  	fencesData.callWrapper('/invoices/getOrderAndInvoice/' + $stateParams.id, 'GET', null)
	    .then(function(result) {
	      $ionicLoading.hide();
	      $scope.pickup = result.Pickup;
        $scope.order = result.Delivery;
        $scope.shippingAddressPretty = formatAddress(
          result.Delivery.shippingAddressName,
          result.Delivery.shippingAddressStreet1,
          result.Delivery.shippingAddressStreet2,
          result.Delivery.shippingAddressCity,
          result.Delivery.shippingAddressState,
          result.Delivery.shippingAddressZip,
        );

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
    $ionicLoading.show({ template: 'Resending labels email' });

    const payload = { email: $scope.shippingInputs.labelsEmail }

    fencesData.postInfo(`/orders/${$stateParams.id}/resendShippingLabelsEmail`, 'POST', payload)
    .then(function(response) {
      $ionicLoading.show({template : 'Labels sent', duration: 500});
    });
  }

  $scope.voidLabels = function() {
    $ionicLoading.show({ template: 'Voiding labels' });

    const payload = {}

    fencesData.postInfo(`/orders/${$stateParams.id}/voidShipment`, 'POST', payload)
    .then(function(response) {
      $ionicLoading.show({template : 'Labels voided', duration: 500});
      $state.go('app.create_shipping_labels', { id: $stateParams.id });
    })
    .catch(function(err) {
      $scope.hasErrors = true;
      if(err) {
        $scope.errorMessage = err.message;
      }
    });
  }

  $scope.formatDate = function(date) {
    if (!date) {
      return null;
    }
  	return moment(date).format('dddd, MMMM Do, YYYY');
  }
});
