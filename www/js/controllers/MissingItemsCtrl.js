angular.module('fencesForBusiness.missing_items_ctrl', ['ngIOS9UIWebViewPatch'])


/**
 * LookupCtrl - A User will type in a text string, most likely customer name and the server will find 
 * results. Display all relevant Orders.
 */
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
      console.log('### got result: ' + JSON.stringify(result));

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
	
  /**
   * Save Invoice
   */
	$scope.saveInvoice = function() {    
    $ionicLoading.show({ template : 'Saving Invoice' });

    $scope.invoices.forEach(function(entry) {
      entry.items.forEach(function(item) {
        if(item.missing_count == 0) {
          item.warehouseStatus = 'Loaded';
        } else if(item.missing_count > 0 && item.missing_count < item.quantity) {
          item.warehouseStatus = 'Partially Loaded';
        } else {
          item.warehouseStatus = 'Missing';
        }
      });
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
