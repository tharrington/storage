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

    var formatAddress = function(name, street1, street2, city, state, zip) {
      if (!name || !street1 || !city || !state || !zip) {
        return '';
      }
      return `${name}, ${street1}, ${street2 ? street2 + ',' : ''} ${city}, ${state} ${zip}`
    };

  	fencesData.callWrapper('/invoices/getOrderAndInvoice/' + $stateParams.id, 'GET', null)
	    .then(function(result) {
	      $ionicLoading.hide();

        if (result.Delivery.shippingEasyPostIds) {
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

    $scope.hasErrors = false;
    $scope.errorMessage = '';
    $scope.individualErrors = [];
    $ionicLoading.show({ template: 'Generating labels' });

    const payload = {
      email:       $scope.shippingInputs.labelsEmail,
      parcels:     $scope.shippingInputs.dimensions,
      toAddress:   $scope.shippingAddress,
    }

    // fencesData.postInfo(`/orders/${$stateParams.id}/purchaseShipment`, 'POST', payload)
    // .then(function(response) {
    //   $ionicLoading.show({template : 'Labels generated and emailed', duration: 500});
    //   $scope.hasErrors = false;
    //   $scope.errorMessage = '';
    //   $scope.individualErrors = [];
    //   $ionicHistory.nextViewOptions({ disableBack: true });
    //   $state.go('app.existing_shipping_labels', { id: $stateParams.id });
    // })
    // .catch(function(err) {
    //   $scope.hasErrors = true;
    //   $ionicLoading.show({template : 'Call failed', duration: 500});
    //   if(err) {
    //     $scope.errorMessage = err.message;
    //     if (err.errors) {
    //       $scope.individualErrors = err.errors;
    //     }
    //   }
    // });
  // }

    /*
     * Create batch shipments
     */
    fencesData.postInfo(`/orders/${$stateParams.id}/createBatchShipment`, 'POST', TODO)
    .then(function(createResponse) {
      $ionicLoading.show({template : 'Purchasing batch shipment'});

      fencesData.callWrapper('/orders/getOrder/' + $stateParams.id, 'GET', null)
      .then(function(orderResponse) {
        if (order.shippingBatchCreatedAt) {
          fencesData.postInfo(`/orders/${$stateParams.id}/purchaseBatchShipment`, 'POST', TODO)
          .then(function(purchaseResponse) {
            // TODO
            $ionicLoading.show({ template: 'Batch shipment purchased.', duration: 1000 });
          })
          .catch(function(err) {
            $ionicLoading.show({ template: 'There was an error purchasing the batch shipment', duration: 1000 });
          });
        } else {
          $ionicLoading.show({ template: 'Batch shipment not yet purchased.', duration: 1000 });
        }
      }, function(err) {
        $ionicLoading.show({ template: 'There was an error loading the order', duration: 1000 });
      });

      $scope.hasErrors = false;
      $scope.errorMessage = '';
      $scope.individualErrors = [];
      $state.go('app.existing_shipping_labels', { id: $stateParams.id });
    })
    .catch(function(err) {
      $scope.hasErrors = true;
      $ionicLoading.show({template : 'Call failed', duration: 500});
      if(err) {
        $scope.errorMessage = err.message;
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
  	return moment(date).format('dddd, MMMM Do, YYYY');
  }

});
