angular.module('fencesForBusiness.missing_items_ctrl', ['ngIOS9UIWebViewPatch'])



.controller('MissingItemsCtrl', function($scope, $location, OrderInvoiceService, $timeout, $sce, 
		$ionicLoading, $window, $ionicPopup, $cordovaInAppBrowser, $interval, $localStorage, 
		$ionicActionSheet, $rootScope, $state, fencesData, $stateParams, $ionicModal, $ionicHistory) {
  
  $scope.images = [];

  $scope.pickup = {};
	$scope.delivery = {};
	$scope.invoices = [];
  $scope.shipping_invoice = {};

  $scope.total_invoice_items = 0;
  $scope.total_shipping_items = 0;
	$ionicLoading.show({ template: 'Loading Order...' });
	$scope.itemUpdates = [
    { warehouseStatus : 'In Storage' },
    { warehouseStatus : 'Partially Loaded' },
    { warehouseStatus : 'Missing' },
    { warehouseStatus : 'Loaded' }
  ];

  $scope.deliveredCount = 0;

	fencesData.callWrapper('/invoices/getOrderAndInvoice/' + $stateParams.id, 'GET', null)
    .then(function(result) {


      $ionicLoading.hide();
      $scope.pickup = result.Pickup;
	  	$scope.delivery = result.Delivery;
	  	$scope.invoices = result.invoices;
      $scope.deliveredCount = 0;
      $scope.missing_count = 0;

      $scope.invoices.forEach(function(inv) {
        inv.imageURLs.forEach(function(img) {
          $scope.images.push({ src : img });
        });

        inv.items.forEach(function(item) {
          if(item.type == 'Storage Goods') {
            if(!item.warehouseStatus) {
              item.warehouseStatus = 'Pulled';
            }
            if(item.warehouseStatus == 'Missing') {
              item.missing_count = item.quantity;
              $scope.missing_count += item.quantity;
            }
            console.log('### missing_count: ' + $scope.missing_count);

            if(item.warehouseStatus == 'Delivered') {
              $scope.deliveredCount++;
            }

            
            if(!item.missing_count) {
              item.missing_count = 0;
            }
          }
          
        });
      });
    }, function(err) {
    	$ionicLoading.show({ template: 'There was an error', duration: 1000 });
    });

  $scope.saveOrder = function() {
    if($scope.delivery.missingItemNote && $scope.delivery.missingItemNote != '' && $scope.images.length > 0) {
      fencesData.postInfo('/orders/' + $scope.delivery._id, 'PUT', $scope.delivery).then(function(result) {
        $ionicLoading.show({template : 'Order Saved', duration: 500});

        // $ionicHistory.nextViewOptions({ disableBack: true });
        // $state.go('app.orders');
        $ionicHistory.goBack();
      });  
    } else if($scope.delivery.missingItemNote && $scope.delivery.missingItemNote != '' && $scope.images.length == 0) {
      var alertPopup = $ionicPopup.alert({
        title: 'Please upload an image'
      });

      alertPopup.then(function(res) {});
    } else if((!$scope.delivery.missingItemNote || $scope.delivery.missingItemNote == '') && $scope.images.length > 0) {
      var alertPopup = $ionicPopup.alert({
        title: 'Please add a description'
      });

      alertPopup.then(function(res) {});
    } 
  }

  $scope.saveOrderFromInvoice = function(warehouseStatus) {
    $scope.pickup.warehouseStatus = warehouseStatus;
    $scope.delivery.warehouseStatus = warehouseStatus;
    fencesData.postInfo('/orders/' + $scope.delivery._id, 'PUT', $scope.delivery).then(function(result) {
    }); 
    fencesData.postInfo('/orders/' + $scope.pickup._id, 'PUT', $scope.pickup).then(function(result) {
    });  
  } 
	
  /**
   * Save Invoice
   */
	$scope.saveInvoice = function() {    
    $ionicLoading.show({ template : 'Saving Invoice' });
    $scope.saveOrder();

    $scope.invoices.forEach(function(entry) {
      var has_missing = false, has_loaded = false;
      entry.items.forEach(function(item) {
        if(item.type == 'Storage Goods') {
          if(item.missing_count == 0) {
            item.warehouseStatus = 'Loaded';
            has_loaded = true;
          } else if(item.missing_count > 0 && item.missing_count < item.quantity) {
            item.warehouseStatus = 'Partially Loaded';
            has_missing = true;
          } else {
            item.warehouseStatus = 'Missing';
            has_missing = true;
          }
        }
        
      });

      if(entry.invoice_type == 'Storage Goods') {
        var whStatus;


        if(has_missing && has_loaded) {
          whStatus = 'Partially Loaded';
        } else if(!has_missing && has_loaded) {
          whStatus = 'Loaded';
        } else if(has_missing && !has_loaded) {
          whStatus = 'Missing';
        } 
        if(whStatus) {
          $scope.saveOrderFromInvoice(whStatus);
        }
        
      }

      fencesData.callWrapper('/invoices/' + entry._id, 'PUT', entry).then(function(result) {
        $ionicLoading.show({template : 'Invoice Saved', duration: 500});
      });
    });
  }

  $scope.increment_count = function(item) {
    if(item.missing_count == item.quantity) {
      item.missing_count;
      return;
    }
    $scope.missing_count++;
    item.missing_count++;

    if(item.missing_count == item.quantity) {
      item.warehouseStatus = 'Missing';
    } else {
      item.warehouseStatus = 'Partially Loaded';
    }
  }

  $scope.decrement_count = function(item) {
    if(item.missing_count == 0) {
      return;
    }
    $scope.missing_count--;
    item.missing_count--;

    if(item.missing_count == 0) {
      item.warehouseStatus = 'Loaded';
    } else {
      item.warehouseStatus = 'Partially Loaded';
    }
  }

});
