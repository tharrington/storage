angular.module('fencesForBusiness.app_ctrl', ['ngIOS9UIWebViewPatch'])
/**
 * This is the main app controller.
 */
.controller('AppCtrl', function($scope, $localStorage, fencesData, $ionicHistory, $state, $ionicLoading, $rootScope) {
  $scope.isSandbox = false;
  $scope.shippingCount = 0;
  $scope.missingCount = 0;

  $scope.$on('$ionicView.enter', function(e) {

    if($localStorage.isStaging) {
      $scope.isSandbox = true;
    } else {
      $scope.isSandbox = false;
    }
    $scope.user = $localStorage.user;
    $scope.mover = $localStorage.mover;

    $scope.moverId = $localStorage.mover ? $localStorage.mover._id : null;

    if (!$rootScope.startedPunchChecks) {
      // $ionicLoading.show({ template: 'Loading Punch...' });
      checkIfPunchedIn();
    }
    console.log('### mover: ' + JSON.stringify($scope.mover));

    if($scope.mover && !$scope.mover.eecode) {
      $rootScope.missingEeCode = true;
    } else if($scope.mover) {
      $rootScope.missingEeCode = false;
    }
    console.log('### user: ' + JSON.stringify($scope.user));
    $rootScope.isMissingTWSEmployeeId = true;


    fencesData.callWrapper('/orders/shippingInfo/today', 'GET', null)
      .then(function(result) {
        $scope.shippingCount = result.length;
      });
    fencesData.callWrapper('/orders/missingOrders/missing', 'GET', null)
      .then(function(result) {

        $scope.missingCount = result.length;
      });
  });

  $scope.displayTrainingMessage = function() {
    $ionicLoading.show({ template:  'This function is not available during training.', duration: 2000 });
  }


  var checkIfPunchedIn = function() {
    if (!$scope.moverId) {
      if ($rootScope.checkPunchinTimeout) clearTimeout($rootScope.checkPunchinTimeout);
      $rootScope.checkPunchinTimeout = setTimeout(checkIfPunchedIn, 180000);
      return
    }
    console.log('### checking for time');
    fencesData.callWrapper('/timepunches/getLastPunch/' + $scope.moverId, 'GET', null)
    .then(function(punchData) {

      console.log('### punchData: ' + JSON.stringify(punchData));
      if(!punchData) {
        $rootScope.isPunchedIn = false;
      } else if(punchData && punchData.isPunchIn) {
        $rootScope.isPunchedIn = true;
      } else {
        $rootScope.isPunchedIn = false;
      }
      // Perioodically check if user is punched in
      $rootScope.punchCheckDelay = 1800000;
      if ($rootScope.checkPunchinTimeout) clearTimeout($rootScope.checkPunchinTimeout);
      $rootScope.checkPunchinTimeout = setTimeout(checkIfPunchedIn, $rootScope.punchCheckDelay);
      $rootScope.startedPunchChecks = true;
    })
    .catch(function(err) {
      $scope.hasErrors = true;
      $rootScope.startedPunchChecks = false
      if (!$rootScope.startedPunchChecks) {
        clearTimeout($rootScope.checkPunchinTimeout);
        $rootScope.checkPunchinTimeout = setTimeout(checkIfPunchedIn, 1800000);
      }

      if(err) {
        $scope.errorMessage = err.message || 'Unknown error';
        if ($scope.errorMessage === 'User does not have Paycom Employee ID') {
          $rootScope.isMissingTWSEmployeeId = true;
        }
      }
    });
  };


  /**
   * 
   */
  $scope.createPunch = function(isPunchIn) {
    $ionicLoading.show({ template: `Punching ${isPunchIn ? 'in' : 'out'}...` });

    var punchTime = Math.floor(new Date().getTime() / 1000) - 60;
    var payload = {
      userId:      $scope.mover.eecode,
      isPunchIn: isPunchIn,
      time:       punchTime,
    };

    console.log('### submitting payload: ' + JSON.stringify(payload));

    fencesData.postInfo('/timepunches/createPunchForUser', 'POST', payload)
    .then(function(punch) {
      console.log('### got punch: ' + JSON.stringify(punch));
      $ionicLoading.show({ template: `Successfully punched ${isPunchIn ? 'in' : 'out'}...`, duration: 500});
      $scope.punch = punch;
      if(punch.errorCount > 0) {
        $ionicLoading.show({template : 'Error loading last punch.', duration: 3000});
      } else if(punch.data[0].punchtype == "ID") {
        $rootScope.isPunchedIn = true;
      } else {
        $rootScope.isPunchedIn = false;
      }
      
      if ($rootScope.checkPunchinTimeout) clearTimeout($rootScope.checkPunchinTimeout);
      $rootScope.checkPunchinTimeout = setTimeout(checkIfPunchedIn, 180000);
    })
    .catch(function(err) {
      $scope.hasErrors = true;
      $ionicLoading.show({template : `Error punching ${isPunchIn ? 'in' : 'out'}.`, duration: 500});
      if(err) {
        $scope.errorMessage = err.message || 'Unknown error';
      }
      if ($rootScope.checkPunchinTimeout) clearTimeout($rootScope.checkPunchinTimeout);
      $rootScope.checkPunchinTimeout = setTimeout(checkIfPunchedIn, 180000);
    })
  }
  
  $scope.logout = function() {
    $rootScope.punchCheckDelay = 0;
    $rootScope.startedPunchChecks = false;
  	$localStorage.token = null;
    $localStorage.user = null;
    $localStorage.token = null;
    $localStorage.mover = null;
    $localStorage.mover_token = null;
    $localStorage.lastTruckLogin = null;

  	$ionicHistory.nextViewOptions({ disableBack: true });
		$state.go('app.login');
  }
})
