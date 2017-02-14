angular.module('fencesForBusiness.today_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('TodayCtrl', function($scope, $rootScope, $ionicPopup, $ionicHistory, $interval, $localStorage, $log, fencesData, $ionicLoading, $state) {
  $scope.completedOrders = [];
  $scope.rescheduledOrders = [];
  $scope.canceledOrders = [];
  $scope.flaggedOrders = [];
  $scope.onScheduleText = 'On Time';
  $scope.dispatchUpdates = [];
  $scope.total_orders = 0;
  $scope.user = $localStorage.user;

  $scope.setDispatchStatus = function() {
    if($scope.dispatch.status == 'Start') {
      $scope.dispatch.status = 'On Time';
    }
  	fencesData.postInfo('/dispatches/' + $scope.dispatch._id, 'PATCH', $scope.dispatch).then(function(result) {
	  });
	  checkStatus();
  }

  $scope.startDispatch = function() {
    $scope.dispatch.status = 'Start';
    $scope.setDispatchStatus();
  }

  $scope.setOrderStatus = function(appointment) {
  	fencesData.postInfo('/orders/' + appointment._id, 'PUT', appointment).then(function(result) {
			$ionicLoading.show({template : 'Order Saved', duration: 500});
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
    { status : 'Servicing' }
  ];

  $scope.deliveryUpdates = [
    { status : 'Appointment Scheduled' },
    { status : 'En Route' },
    { status : 'Arrived' },
    { status : 'Servicing' },
    { status : 'Complete' }
  ];

  function checkStatus() {
  	if($scope.dispatch && $scope.dispatch.status == 'New') {
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
      console.log('### result: ' + JSON.stringify(result));

  		if($scope.dispatch && $scope.dispatch.orders) {
        $scope.total_orders = 0;
  			$scope.dispatch.orders.forEach(function(entry) {
          var today = moment();
          
          var delDate = moment(entry.deliveryDate);
          if(today.isSame(delDate, 'day')) {
            $scope.total_orders++;
            if(entry.status == 'Complete') {
              $scope.completedOrders.push(entry);
            } else if(entry.status == 'Rescheduled') {
              $scope.rescheduledOrders.push(entry);
            } else if(entry.status == 'Canceled') {
              $scope.canceledOrders.push(entry);
            } else if(entry.status == 'Flagged') {
              $scope.flaggedOrders.push(entry);
            } else {
              $scope.orders.push(entry);
            }
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
    $scope.user = $localStorage.user;
  	$scope.getOrders();
  });

  $scope.viewOrder = function(order) {
  	$ionicLoading.hide();
	  $state.go('app.orders', { id : order._id });
  };
});
