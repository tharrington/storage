angular.module('fencesForBusiness.app_ctrl', ['ngIOS9UIWebViewPatch'])
/**
 * This is the main app controller.
 */
.controller('AppCtrl', function($scope, $localStorage, fencesData, $ionicHistory, $state, $ionicLoading) {
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

    $scope.userId = $localStorage.user ? $localStorage.user._id : $localStorage.mover._id;

    $ionicLoading.show({ template: 'Loading Punch...' });
    fencesData.callWrapper('/punches/getLastPunch/' + $scope.userId, 'GET', null)
    .then(punch => {
      $ionicLoading.hide();
      $scope.punch = punch;
      $scope.isPunchedIn = $scope.punch && !$scope.punch.timeOut;
    })
    .catch(err => {
      $scope.isPunchedIn = false;
      $scope.hasErrors = true;
      $ionicLoading.show({template : 'Error loading last punch.', duration: 500});
      if(err) {
        $scope.errorMessage = err.message || 'Unknown error';
      }
    });

  });

  $scope.punchIn = () => {
    $ionicLoading.show({ template: 'Punching in...' });
    fencesData.postInfo('/punches/punchIn', 'POST', { userId: $scope.userId })
    .then(punch => {
      $ionicLoading.show({ template: 'Successfully punched in', duration: 500});
      $scope.punch = punch;
      $scope.isPunchedIn = true;
    })
    .catch(err => {
      $scope.hasErrors = true;
      $ionicLoading.show({template : 'Error punching in.', duration: 500});
      if(err) {
        $scope.errorMessage = err.message || 'Unknown error';
      }
    })
  }

  $scope.punchOut = () => {
    $ionicLoading.show({ template: 'Punching out...' });
    fencesData.postInfo(`/punches/${$scope.punch._id}/punchOut`, 'POST', {})
    .then(punch => {
      $ionicLoading.show({ template: 'Successfully punched out', duration: 500});
      $scope.isPunchedIn = false;
    })
    .catch(err => {
      $scope.hasErrors = true;
      $ionicLoading.show({template : 'Error punching out.', duration: 500});
      if(err) {
        $scope.errorMessage = err.message || 'Unknown error';
      }
    })
  }

  $scope.logout = function() {
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
