angular.module('fencesForBusiness.order_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('OrderCtrl', function($scope, $window, $ionicPopup, $cordovaInAppBrowser, $interval, $localStorage, $ionicActionSheet, $rootScope, $state, fencesData, $stateParams, $ionicModal, $ionicHistory) {
  $scope.order_status;

	$scope.openInGoogleMaps = function() {
		if($scope.order && $scope.order.position) {
			var lat = parseFloat($scope.order.position.coords.latitude);
			var lng = parseFloat($scope.order.position.coords.longitude);
			var text = $scope.order.building || $scope.order.address;
			launchnavigator.navigate([lat, lng]);
		}
	};

	$scope.openInSalesforce1 = function() {
		console.log('### OPENING IN SALESFORCE1');
		var scheme = "com.salesforce.salesforce1://";
		window.open(scheme, '_system', 'location=no');
	};

	$scope.orderUpdates = [
		{ status : 'Appointment Scheduled' },
  	{ status : 'En Route' },
  	{ status : 'Arrived' },
  	{ status : 'Rescheduled' },
  	{ status : 'Complete' },
  	{ status : 'Flagged' }
  ];

  console.log('### LOADED ORDER: ' + $stateParams.id);
  /**
   * Get the order
   */
  fencesData.getOrder($stateParams.id).then(function(result) {
		$scope.order = result;
    $scope.order_status = result.status;
	});

  $scope.$on('$ionicView.enter', function(e) {
    fencesData.getOrder($stateParams.id).then(function(result) {
      $scope.order = result;
      $scope.order_status = result.status;
    });
  });


  /**
   * Sends a status update, depending on current status.
   */ 
  $scope.sendUpdate = function() {
    if(($scope.order.status == 'Flagged' || $scope.order.status == 'Rescheduled') && 
      (!$scope.order.notes || $scope.order.notes.trim().length == 0)) {
      var alertPopup = $ionicPopup.alert({
        title: 'NOT SAVED',
        template: 'You must enter notes for flagged or rescheduled orders.'
      });
      $scope.order.status = $scope.order_status;

      alertPopup.then(function(res) {
      });
    } else {
      if($scope.order && $scope.order._id) {
        console.log('### send update: ' + JSON.stringify($scope.order));
        fencesData.postInfo('/orders/' + $scope.order._id, 'PUT', $scope.order).then(function(result) {
          $scope.order_status = result.status;
          if($scope.order.status == 'Complete') {
            $state.go('app.orders');
          } else {
            var alertPopup = $ionicPopup.alert({
              title: 'Order Saved.',
              template: 'Status and notes updated.'
            });

            alertPopup.then(function(res) {
            });
          }
        });

        // update the dispatch status if it hasn't been started.
        if($rootScope.dispatch && $rootScope.dispatch.status == 'Started') {
          $rootScope.dispatch.status = 'On Time';
          fencesData.postInfo('/dispatches/' + $rootScope.dispatch._id, 'PATCH', $rootScope.dispatch).then(function(result) {
          });
        }
      }
    }
  };
});
