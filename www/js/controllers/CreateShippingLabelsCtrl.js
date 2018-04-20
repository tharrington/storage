angular.module('fencesForBusiness.create_shipping_labels_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('CreateShippingLabelsCtrl', function($scope, OrderInvoiceService, $ionicLoading, $state, fencesData, $stateParams, $rootScope, $ionicHistory) {

  $scope.$on( "$ionicView.leave", function( scopes ) { });

  $scope.$on( "$ionicView.enter", function( scopes ) {
  	$ionicLoading.show({ template: 'Loading Order...' });

    $scope.errorMessage         = '';
    $scope.individualErrors     = [];
    $scope.hasErrors            = false;
    $scope.pickup               = {};
    $scope.shippingInputs       = { dimensions: [], labelsEmail: null };
    $scope.shipping_invoice     = {};
    $scope.total_invoice_items  = 0;
    $scope.total_shipping_items = 0;
    $scope.batchFetchAttempts   = 0;

    var formatAddress = function(name, street1, street2, city, state, zip) {
      if (!name || !street1 || !city || !state || !zip) {
        return '';
      }
      return `${name}, ${street1}, ${street2 ? street2 + ',' : ''} ${city}, ${state} ${zip}`
    };

  	fencesData.callWrapper('/invoices/getOrderAndInvoice/' + $stateParams.id, 'GET', null)
	    .then(function(result) {
	      $ionicLoading.hide();

        if (result.Delivery.shippingEasyPostIds && result.Delivery.shippingEasyPostIds != null) {
          console.log('result.Delivery.shippingEasyPostIds', result.Delivery.shippingEasyPostIds);
          $state.go('app.existing_shipping_labels', { id: $stateParams.id });
        }

	      $scope.pickup = result.Pickup;
        $scope.shippingDate = result.Delivery.shippingDate;
        $scope.shippingDescription = result.Delivery.shippingDescription;
        $scope.shippingAddress = {
          name:    result.Delivery.shippingAddressName,
          street1: result.Delivery.shippingAddressStreet1,
          street2: result.Delivery.shippingAddressStreet2,
          city:    result.Delivery.shippingAddressCity,
          state:   result.Delivery.shippingAddressState,
          zip:     result.Delivery.shippingAddressZip
        }
        $scope.shippingAddressPretty = formatAddress(
          result.Delivery.shippingAddressName,
          result.Delivery.shippingAddressStreet1,
          result.Delivery.shippingAddressStreet2,
          result.Delivery.shippingAddressCity,
          result.Delivery.shippingAddressState,
          result.Delivery.shippingAddressZip
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

  $scope.addMegaBox = function() {
    $scope.shippingInputs.dimensions.push({
      length: 24,
      width: 18,
      height: 16,
      weight: null,
    });
  }

  $scope.addOtherItem = function() {
    $scope.shippingInputs.dimensions.push({});
  }

  $scope.deleteItem = function(index) {
    $scope.shippingInputs.dimensions.splice(index, 1);
  }

  $scope.processLabels = function() {
    if (!$scope.shippingInputs.labelsEmail) {
      $scope.hasErrors = true;
      $scope.errorMessage = 'Email required';
      return
    }

    if ($scope.shippingInputs.dimensions.length === 0) {
      $scope.hasErrors = true;
      $scope.errorMessage = 'At least one item required';
      return
    }

    $scope.shippingInputs.dimensions.forEach(function(d) {
      if (isNil(d['length']) || isNil(d['width']) || isNil(d['height']) || isNil(d['weight'])) {
        $scope.hasErrors = true;
        $scope.errorMessage = 'All item dimensions must have a value.';
        return
      }
      if ((d['length'] <= 0) || (d['width'] <= 0) || (d['height'] <= 0) || (d['weight'] <= 0)) {
        $scope.hasErrors = true;
        $scope.errorMessage = 'All item dimensions must be greater than zero.';
        return
      }
    });

    // var parcels = $scope.shippingInputs.dimensions.map(d => {
    //   return {
    //     length: d['length'],
    //     width:  d['width'],
    //     height: d['height'],
    //     weight: roundVal(16*d['weight'], 2),
    //   }
    // });

    var parcels = [];
    $scope.shippingInputs.dimensions.forEach(function(d) {
      parcels.push( {
        length: d['length'],
        width:  d['width'],
        height: d['height'],
        weight: roundVal(16*d['weight'], 2),
      });
    });



    $scope.hasErrors = false;
    $scope.errorMessage = '';
    $scope.individualErrors = [];
    $ionicLoading.show({ template: 'Generating labels' });

    var payload = {
      email:             $scope.shippingInputs.labelsEmail,
      parcels:           parcels,
      toAddress:         $scope.shippingAddress,
    }

    fencesData.postInfo(`/orders/${$stateParams.id}/createBatch`, 'POST', payload)
    .then(function(response) {
      $scope.hasErrors = false;
      $scope.errorMessage = '';
      $scope.individualErrors = [];
      $ionicLoading.show({template : 'Generating labels...'});

      $scope.batchFetchAttempts = 0;

      function checkLabelsGenerated() {
        fencesData.callWrapper('/invoices/getOrderAndInvoice/' + $stateParams.id, 'GET', null)
        .then(function(result) {
          $scope.batchFetchAttempts += 1;
          var order = result.Delivery;
          if (order.batch && order.batch.state === 'label_generated') {
            $ionicLoading.hide();
            $state.go('app.existing_shipping_labels', { id: $stateParams.id });
          } else if($scope.batchFetchAttempts > 20) {
            $ionicLoading.hide();
            $scope.hasErrors = true;
            $scope.errorMessage = 'Labels failed to create';
          } else {
            if (order.batch) {
              $ionicLoading.show({template : `${_.capitalize(order.batch.state).replace('_', ' ')}...`});
            }
            setTimeout(checkLabelsGenerated, 1000);
          }
        })
        .catch(function(e){
          $scope.hasErrors = true;
          $ionicLoading.show({template : 'Call failed', duration: 500});
          if(err) {
            $scope.errorMessage = err.message || 'Unknown error';
          }
        });
      }

      checkLabelsGenerated();
    })
    .catch(function(err) {
      $scope.hasErrors = true;
      $ionicLoading.show({template : 'Call failed', duration: 500});
      if(err) {
        $scope.errorMessage = err.message || 'Unknown error';
        if (err.errors) {
          $scope.individualErrors = err.errors;
        }
      }
    });
  }

  $scope.formatDate = function(date) {
    if (!date) {
      return null;
    }
    return moment.utc(date).format('dddd, MMMM Do, YYYY');
  }

});

function roundVal(val, dec) {
  var lb = Math.round(val*Math.pow(10, dec))/ Math.pow(10, dec);
  return lb;
}

function isNil(val) {
  return val === null;
}
