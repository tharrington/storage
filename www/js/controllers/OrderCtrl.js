angular.module('fencesForBusiness.order_ctrl', ['ngIOS9UIWebViewPatch'])

/**
 * OrderCtrl - view the order details and update the status.
 */
.controller('OrderCtrl', function($scope, $window, $ionicPopup, $ionicLoading, $cordovaInAppBrowser, $interval, $localStorage, $ionicActionSheet, $rootScope, $state, fencesData, $stateParams, $ionicModal, $ionicHistory) {
  $scope.order_status;
  $scope.user = $localStorage.user;

	$scope.openInGoogleMaps = function() {
		if($scope.order && $scope.order.position) {
			var lat = parseFloat($scope.order.position.coords.latitude);
			var lng = parseFloat($scope.order.position.coords.longitude);
			var text = $scope.order.building || $scope.order.address;
			launchnavigator.navigate([lat, lng]);
		}
	};

	$scope.openInSalesforce1 = function() {
		var scheme = "com.salesforce.salesforce1://";
		window.open(scheme, '_system', 'location=no');
	};

	$scope.orderUpdates = [
    { status : 'Ok'},
  	{ status : 'Rescheduled' },
    { status : 'No Answer' },
    { status : 'Canceled' }
  ];

  $scope.deliveryUpdates = [
    { status : 'Rescheduled' },
    { status : 'No Answer' },
    { status : 'Complete' }
  ];

  $scope.formatNumber = function(s) {
    var s2 = (""+s).replace(/\D/g, '');
    var m = s2.match(/^(\d{3})(\d{3})(\d{4})$/);
    return (!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3];
  }


  /**
   * Get the order
   */
  fencesData.getOrder($stateParams.id).then(function(result) {
		$scope.order = result;
    if($scope.order.status == 'En Route' || $scope.order.status == 'Arrived' || $scope.order.status == 'Completed'){
      $scope.order.notes = '';
    }
    if($scope.order.type == 'Delivery') {
      $scope.orderUpdates({ status: 'Complete- Left Unattended' });
    }
    $scope.order_status = result.status;
	});

  $scope.$on('$ionicView.enter', function(e) {
    fencesData.getOrder($stateParams.id).then(function(result) {
      $scope.order = result;
      $scope.order_status = result.status;
    });
  });


  /**
   * Complete the invoice
   */

  $scope.completeInvoice = function() {
    $state.go('app.invoice', { id : $scope.order.ssOrderId });
  }

  /**
   * Sends a status update, depending on current status of the order
   */ 
  $scope.sendUpdate = function() {
    if(($scope.order.status == 'No Answer' || $scope.order.status == 'Rescheduled' || $scope.order.status == 'Canceled') && 
      (!$scope.order.notes || $scope.order.notes.trim().length == 0)) {
      var alertPopup = $ionicPopup.alert({
        title: 'NOT SAVED',
        template: 'You must enter notes for rescheduled orders.'
      });
      alertPopup.then(function(res) { });
    } else {

      if($scope.order && $scope.order._id) {

        if($scope.order.status == 'No Answer') {
          $scope.order.status = 'Rescheduled';
          $scope.order.notes = 'No Answer - ' + $scope.order.notes;
        }

        fencesData.postInfo('/orders/' + $scope.order._id, 'PUT', $scope.order).then(function(result) {
          $scope.order_status = result.status;
          $ionicLoading.show({template : 'Order Saved', duration: 500});
          $state.go('app.today');
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
