angular.module('fencesForBusiness.app_ctrl', ['ngIOS9UIWebViewPatch'])
/**
 * This is the main app controller.
 */
.controller('AppCtrl', function($scope, $localStorage, fencesData, $ionicHistory, $state, $ionicLoading, $rootScope) {
  $scope.isSandbox = false;

  $scope.$on('$ionicView.enter', function(e) {
    console.log('apctrl loading....');
    if($localStorage.isStaging) {
      $scope.isSandbox = true;
    } else {
      $scope.isSandbox = false;
    }
    $scope.user = $localStorage.user;
    $scope.mover = $localStorage.mover;

    $scope.moverId = $localStorage.mover ? $localStorage.mover._id : null;

    if (!$rootScope.startedPunchChecks) {
      $ionicLoading.show({ template: 'Loading Punch...' });
      checkIfPunchedIn();
    }

    $rootScope.isMissingTWSEmployeeId = false;
  });

  const checkIfPunchedIn = () => {
    if (!$scope.moverId) {
      if ($rootScope.checkPunchinTimeout) clearTimeout($rootScope.checkPunchinTimeout);
      $rootScope.checkPunchinTimeout = setTimeout(checkIfPunchedIn, 180000);
      $ionicLoading.hide();
      return
    }
    fencesData.callWrapper('/punches/getLastStratusTimePunch/' + $scope.moverId, 'GET', null)
    .then(stratusTimePunch => {
      $ionicLoading.hide();
      $scope.stratusTimePunch = stratusTimePunch;
      $rootScope.isPunchedIn = $scope.stratusTimePunch && (!$scope.stratusTimePunch.OutTime);
      // Perioodically check if user is punched in
      $rootScope.punchCheckDelay = 180000;
      if ($rootScope.checkPunchinTimeout) clearTimeout($rootScope.checkPunchinTimeout);
      $rootScope.checkPunchinTimeout = setTimeout(checkIfPunchedIn, $rootScope.punchCheckDelay);
      $rootScope.startedPunchChecks = true;
    })
    .catch(err => {
      $scope.hasErrors = true;
      $rootScope.startedPunchChecks = false
      if (!$rootScope.startedPunchChecks) {
        clearTimeout($rootScope.checkPunchinTimeout);
        $rootScope.checkPunchinTimeout = setTimeout(checkIfPunchedIn, 180000);
      }
      $ionicLoading.show({template : 'Error loading last punch.', duration: 500});
      if(err) {
        $scope.errorMessage = err.message || 'Unknown error';
        if ($scope.errorMessage === 'User does not have TWS Employee ID') {
          $rootScope.isMissingTWSEmployeeId = true;
        }
      }
    });
  };

  $scope.createPunch = (isPunchIn) => {
    $rootScope.punchCheckDelay = 0;
    $ionicLoading.show({ template: `Punching ${isPunchIn ? 'in' : 'out'}...` });
    const payload = {
      userId:      $scope.moverId,
      time:        (new Date()).getTime(),
      isPunchIn: isPunchIn,
    };
    fencesData.postInfo('/punches', 'POST', payload)
    .then(punch => {
      $ionicLoading.show({ template: `Successfully punched ${isPunchIn ? 'in' : 'out'}...`, duration: 500});
      $scope.punch = punch;
      $rootScope.isPunchedIn = isPunchIn;
      if ($rootScope.checkPunchinTimeout) clearTimeout($rootScope.checkPunchinTimeout);
      $rootScope.checkPunchinTimeout = setTimeout(checkIfPunchedIn, 180000);
    })
    .catch(err => {
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
