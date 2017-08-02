angular.module('fencesForBusiness.missing_items_ctrl', ['ngIOS9UIWebViewPatch'])


/**
 * LookupCtrl - A User will type in a text string, most likely customer name and the server will find 
 * results. Display all relevant Orders.
 */
.controller('MissingItemsCtrl', function($scope, $location, OrderInvoiceService, $timeout, $sce, 
		$ionicLoading, $window, $ionicPopup, $cordovaInAppBrowser, $interval, $localStorage, 
		$ionicActionSheet, $rootScope, $state, fencesData, $stateParams, $ionicModal, $ionicHistory) {
  
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


	fencesData.callWrapper('/invoices/getOrderAndInvoice/' + $stateParams.id, 'GET', null)
    .then(function(result) {
      console.log('### got result: ' + JSON.stringify(result));

      $ionicLoading.hide();
      $scope.pickup = result.Pickup;
	  	$scope.delivery = result.Delivery;
	  	$scope.invoices = result.invoices;
    }, function(err) {
    	$ionicLoading.show({ template: 'There was an error', duration: 1000 });
    });
	
  /**
   * Save Invoice
   */
	$scope.saveInvoice = function() {    
    $ionicLoading.show({ template : 'Saving Invoice' });

    $scope.invoices.forEach(function(entry) {
    	if(entry.invoice_type == 'Storage Goods') {
    		fencesData.callWrapper('/invoices/' + entry._id, 'PUT', entry).then(function(result) {
		      $ionicLoading.show({template : 'Invoice Saved', duration: 500});
		    });
    	}
    });
    
  }
});
