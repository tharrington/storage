angular.module('fencesForBusiness.lookup_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('LookupCtrl', function($scope, OrderInvoiceService, $timeout, $sce, $ionicLoading, $window, $ionicPopup, $cordovaInAppBrowser, $interval, $localStorage, $ionicActionSheet, $rootScope, $state, fencesData, $stateParams, $ionicModal, $ionicHistory) {
  $scope.results = [];

	$scope.inputChanged = function(val){
		console.log('### searching: ' + val);

		$ionicLoading.show({ template: 'Searching Orders...' });

    fencesData.callWrapper('/invoices/search/' + val, 'GET', null)
	    .then(function(results) {
	      $ionicLoading.hide();
	      console.log('### got results: ' + JSON.stringify(results));
	      $scope.results = results;
	    }, function(err) {
	    	console.log('### err: ' + err);
	    	$ionicLoading.show({ template: 'There was an error', duration: 1000 });
	    });
	}
});
