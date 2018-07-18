angular.module('fencesForBusiness.today_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('TodayCtrl', function($scope, mockFencesData, $ionicActionSheet, ApiEndpoint, ApiEndpointStaging, $http, Auth, $rootScope, $ionicPopup, $ionicHistory, $interval, $localStorage, $log, fencesData, $ionicLoading, $state) {
  $scope.completedOrders = [];
  $scope.rescheduledOrders = [];
  $scope.canceledOrders = [];
  $scope.flaggedOrders = [];
  $scope.onScheduleText = 'On Time';
  $scope.dispatchUpdates = [];
  $scope.total_orders = 0;
  $scope.user = $localStorage.user;
  $scope.loading = true;
  $scope.training_complete = false;


  $scope.changeLocation = function() {
    var mover = $localStorage.mover;
    $scope.dispatch.mover = mover._id;
    $scope.dispatch.set_mover = true;

    fencesData.postInfo('/dispatches/' + $scope.dispatch._id, 'PATCH', $scope.dispatch).then(function(result) {
      $scope.getOrders();
    });
  }

  /**
   * Set's the dispatch status
   */ 
  $scope.setDispatchStatus = function() {
  	fencesData.postInfo('/dispatches/' + $scope.dispatch._id, 'PATCH', $scope.dispatch).then(function(result) {
	    if($scope.dispatch.status == 'Start') {
        $scope.dispatch.status = 'On Time';
      }
    });
	  checkStatus();
  }

  $scope.startDispatch = function() {
    var alertPopup = $ionicPopup.alert({
      title: 'Before starting your route you must have the following supplies with you in the truck:',
      template: '<ul>' + 
          '<li> - Dollies (one per Crew Member)</li>' +
          '<li> - 20-30 Empty Mega Boxes</li>' +
          '<li> - Truck Supply Box</li>' +
          '<li> - Driver Bin (with car charger)</li>' +
        '</ul><br/>' +
        '<strong style="text-align:center;">DO NOT LEAVE THE WAREHOUSE WITHOUT THESE ITEMS!</strong>'
    });

    alertPopup.then(function(res) {
      $scope.dispatch.status = 'Start';
      $scope.setDispatchStatus();
    });
  }

  $scope.setOrderStatus = function(appointment) {
    if(appointment.status == 'Scheduled') {
      appointment.status = 'Appointment Scheduled';
    }
    fencesData.postInfo('/orders/' + appointment._id, 'PUT', appointment).then(function(result) {
      if(appointment.status == 'Appointment Scheduled') {
        appointment.status = 'Scheduled';
      }
      $ionicLoading.show({template : 'Order Saved', duration: 500});
      $scope.getOrders();
    });
  }


  $scope.substringField = function(value) {
  	if(!value) return 'Not declared';
  	if(value.length < 10) return value;
  	return value.substring(0, 10);
  }

  $scope.orderUpdates = [
    { status : 'Scheduled' },
  	{ status : 'En Route' },
  	{ status : 'Arrived' },
    { status : 'Servicing' }
  ];

  $scope.deliveryUpdates = [
    { status : 'Scheduled' },
    { status : 'En Route' },
    { status : 'Arrived' },
    { status : 'Servicing' }
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
      console.log('### got dispatch: ' + JSON.stringify(result));
  		$scope.dispatch = result;
  		$rootScope.dispatch = result;
  		$ionicLoading.hide();

  		if($scope.dispatch && $scope.dispatch.orders) {
        $scope.total_orders = 0;
  			$scope.dispatch.orders.forEach(function(entry) {
          var today = moment();
          var delDate = moment(entry.deliveryDate).add(3, 'h');

          // Make sure the order date is the same day as the current date.
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
            } else if(entry.warehouseStatus != 'Missing') {
              $scope.orders.push(entry);
            }
          }
          if(entry.status == 'Appointment Scheduled') {
            entry.status = 'Scheduled';
          }

	  		});
  		}
      $scope.loading = false;

  		checkStatus();
	  }).finally(function() {
      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete');
    });;
  }

  $scope.completeTraining = function() {
    var validate_result = mockFencesData.validateTutorial();

    if(validate_result.is_valid) {
      var config;
      if(!$localStorage.isStaging) {
        config = { url: ApiEndpoint.url + '/users/training/completeTraining', timeout: 6000, method: 'GET' };
      } else {
        config = { url: ApiEndpointStaging.url + '/users/training/completeTraining', timeout: 6000, method: 'GET' };
      }

      $rootScope.isTraining = false;
      $localStorage.token = null;
      
      $http(config).success(function(data, status, header, config) {
        $localStorage.mover = data;
        $ionicLoading.show({template : 'Training Successful! Excellent Work!' , duration: 4000});
        $ionicHistory.nextViewOptions({ disableBack: true });
        $state.go('app.drivers');
      }).error(function(data, status, header, config) {
      });
    } else{
      $ionicLoading.show({ template: validate_result.message, duration: 3000 });
    }
    
  }

  $scope.getOrders = function() {
  	$scope.orders = [];
  	$scope.completedOrders = [];
  	$scope.flaggedOrders = [];
  	$scope.rescheduledOrders = [];
    $scope.canceledOrders = [];
  	$scope.dispatch = {};
  	$ionicLoading.show({ template: 'Loading dispatch...' });
  	organizeOrders();
  };

  $scope.$on('$ionicView.enter', function(e) {
    $scope.user = $localStorage.user;
    Auth.checkLastTruckLogin();
  	$scope.getOrders();
  });

  $scope.viewOrder = function(order) {
  	$ionicLoading.hide();
	  $state.go('app.order', { id : order._id });
  };

  $scope.viewCompletedAppointment = function(appointment) {
    $state.go('app.order', { id : appointment._id });
  }
});
