angular.module('fencesForBusiness.lookup_ctrl', ['ngIOS9UIWebViewPatch'])


/**
 * LookupCtrl - A User will type in a text string, most likely customer name and the server will find 
 * results. Display all relevant Orders.
 */
.controller('LookupCtrl', function($scope, $location, OrderInvoiceService, $timeout, $sce, $ionicLoading, $window, $ionicPopup, $cordovaInAppBrowser, $interval, $localStorage, $ionicActionSheet, $rootScope, $state, fencesData, $stateParams, $ionicModal, $ionicHistory) {
  $scope.results = [];

  $scope.vm = {};
  $scope.title = 'Customer Lookup';
  
  $scope.$on('$ionicView.enter', function(e) {
  	$scope.user = $localStorage.user;
  	$scope.mover = $localStorage.mover;

  	console.log('### query: ' + $scope.vm.query);
  	if($scope.vm && $scope.vm.query) {
  		$scope.inputChanged($scope.vm.query);
  	}

  	var currentState = $state.current.name;
  	$scope.title = 'Customer Lookup';
  	if(currentState == 'app.supplies-lookup') {
			$scope.title = 'Supply Handout'
		} 
  });


	$scope.inputChanged = function(val){

		$ionicLoading.show({ template: 'Searching Orders...' });

		var token = $localStorage.token;
    $localStorage.token = null;
    console.log('### mover token: ' + $localStorage.mover_token);

    fencesData.callWrapper('/invoices/search/' + val, 'GET', null)
	    .then(function(results) {
	      $ionicLoading.hide();
        console.log('### results: ' + JSON.stringify(results));

	      $scope.user = $localStorage.user;
  			$scope.mover = $localStorage.mover;

	      if($scope.mover && $scope.mover.region == 'all') {
	      	$scope.results = results;
	      } else if($scope.mover) {
	      	$scope.results = [];
	      	results.forEach(function(entry) {
	      		if(entry.region == $scope.mover.region) {
	      			$scope.results.push(entry);
	      		}
	      	});
	      }
	      //reset token
        console.log('### reseting token: ' + token);
        $localStorage.token = token;
	    }, function(err) {
	    	$ionicLoading.show({ template: 'There was an error', duration: 1000 });
	    });
	}

	$scope.navigateToOrder = function(order) {
		var currentState = $state.current.name;

		OrderInvoiceService.setOrderInvoice(order);

		if(currentState == 'app.supplies-lookup') {
			$state.go('app.supplies', { id : order.ssOrderId });
		} else {
			$state.go('app.order_summary', { id : order.ssOrderId });
		}
	};
});
