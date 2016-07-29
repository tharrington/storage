angular.module('fencesForBusiness.today_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('TodayCtrl', function($scope, $rootScope, $ionicPopup, $ionicHistory, $interval, $localStorage, $log, fencesData, $ionicLoading, $state) {
  $scope.completedOrders = [];
  $scope.rescheduledOrders = [];
  $scope.flaggedOrders = [];
  $scope.onScheduleText = 'On Time';
  $scope.dispatchUpdates = [];

  $scope.setDispatchStatus = function() {
  	fencesData.postInfo('/dispatches/' + $scope.dispatch._id, 'PATCH', $scope.dispatch).then(function(result) {
	  });
	  checkStatus();
  }

  $scope.setOrderStatus = function(appointment) {
  	fencesData.postInfo('/orders/' + appointment._id, 'PUT', appointment).then(function(result) {
			var alertPopup = $ionicPopup.alert({
		    title: 'Order Saved.',
		    template: 'Order Updated'
		  });
		});
  }


  $scope.substringField = function(value) {
  	if(!value) return 'Not declared';
  	if(value.length < 10) return value;
  	return value.substring(0, 10);
  }

  $scope.orderUpdates = [
		{ status : 'Appointment Scheduled' },
  	{ status : 'En Route' },
  	{ status : 'Arrived' },
  	//{ status : 'Rescheduled' },
  	{ status : 'Complete' },
  	//{ status : 'Flagged' }
  ];

  function checkStatus() {
  	if($scope.dispatch.status == 'New') {
  		$scope.dispatchUpdates = [
  				{ status : 'New' },
			  	{ status : 'Start' }
			  ];
		} else {
			if($scope.dispatch && $scope.dispatch.orders) {
	  		$scope.dispatchUpdates = [
			  	{ status : 'over an hour ahead' },
			  	{ status : '45 minutes ahead' },
			  	{ status : '30 minutes ahead' },
			  	{ status : '15 minutes ahead' },
			  	{ status : 'On Time' },
			  	{ status : '15 minutes behind' },
			  	{ status : '30 minutes behind' },
			  	{ status : '45 minutes behind' },
			  	{ status : 'over an hour behind' }
			  ];
  		}
		}
  }
  
  function organizeOrders() {
  	fencesData.getTodaysDispatch().then(function(result) {
  		$scope.dispatch = result;
  		$rootScope.dispatch = result;
  		$ionicLoading.hide();

  		if($scope.dispatch && $scope.dispatch.orders) {
  			$scope.dispatch.orders.forEach(function(entry) {
	  			if(entry.status == 'Complete') {
	  				$scope.completedOrders.push(entry);
	  			} else if(entry.status == 'Rescheduled') {
	  				$scope.rescheduledOrders.push(entry);
	  			} else if(entry.status == 'Flagged') {
	  				$scope.flaggedOrders.push(entry);
	  			}else {
	  				$scope.orders.push(entry);
	  			}
	  		});
  		}
  		checkStatus();
  		
	  }).finally(function() {
      $log.info('Hit finally');
      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete');
    });;
  }

  $scope.getOrders = function() {
  	$scope.orders = [];
  	$scope.completedOrders = [];
  	$scope.flaggedOrders = [];
  	$scope.rescheduledOrders = [];
  	$scope.dispatch = {};
  	$ionicLoading.show({ template: 'Loading dispatch...' });
  	organizeOrders();
  };

  $scope.$on('$ionicView.enter', function(e) {
  	$scope.getOrders();
  });

  $scope.viewOrder = function(order) {
  	$ionicLoading.hide();
	  $state.go('app.orders', { id : order._id });
  };
});
