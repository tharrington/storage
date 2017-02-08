angular.module('fencesForBusiness.lookup_ctrl', ['ngIOS9UIWebViewPatch'])


/**
 * LookupCtrl - A User will type in a text string, most likely customer name and the server will find 
 * results. Display all relevant Orders.
 */
.controller('LookupCtrl', function($scope, OrderInvoiceService, $timeout, $sce, $ionicLoading, $window, $ionicPopup, $cordovaInAppBrowser, $interval, $localStorage, $ionicActionSheet, $rootScope, $state, fencesData, $stateParams, $ionicModal, $ionicHistory) {
  $scope.results = [];

	$scope.inputChanged = function(val){
		$ionicLoading.show({ template: 'Searching Orders...' });

    fencesData.callWrapper('/invoices/search/' + val, 'GET', null)
	    .then(function(results) {
	      $ionicLoading.hide();
	      $scope.results = results;
	    }, function(err) {
	    	$ionicLoading.show({ template: 'There was an error', duration: 1000 });
	    });
	}

	$scope.navigateToOrder = function(order) {
		$state.go('app.order_summary', { id : order.ssOrderId });
	};
});
