angular.module('fencesForBusiness.drivers_ctrl', ['ngIOS9UIWebViewPatch'])

/**
 * Drivers Controller - Login as a driver or complete the tutorial
 */
.controller('DriversCtrl', function($scope, $rootScope, $ionicHistory, $ionicPopup, $localStorage, fencesData, $ionicLoading, Auth, $state, $stateParams) {
  $scope.title = "Complete Tutorial";
  $scope.currentUser = {};
  $scope.drivers = [];


  // check if the mover has completed the tutorial
  if($localStorage.mover_token) {
    $scope.currentUser = $localStorage.mover;
    console.log('### currentUser: ' + JSON.stringify($scope.currentUser));

   	if($scope.currentUser.tutorialCompleted) {
   		$scope.title = "Select Your Truck";

   		$ionicLoading.show({ template: 'Finding available trucks...' });

   		fencesData.callWrapper('/users/driversByRegion' , 'GET', null)
		    .then(function(results) {
		      $ionicLoading.hide();
		      $scope.drivers = results;
		    }, function(err) {
		    	$ionicLoading.show({ template: 'There was an error', duration: 1000 });
		    });
   	}
  }
    
  $scope.loginAsUser = function(user) {
    user.password = 'Storage1';

    Auth.login(user)
      .then( function() {
        $ionicHistory.nextViewOptions({ disableBack: true });
        $localStorage.lastTruckLogin = moment();
        $state.go('app.orders');
      })
      .catch( function(err) {
        $scope.hasErrors = true;
        $scope.errorMessage = err.message;
      });
  }

  $scope.doTutorial = function() {
  	console.log('### completing tutorial...');
    $rootScope.isTutorial = true;
    $scope.isTutorial = true;

    fencesData.callWrapper('/users/driversByRegion' , 'GET', null)
      .then(function(results) {
        $ionicLoading.hide();
        $scope.drivers = results;
      }, function(err) {
        $ionicLoading.show({ template: 'There was an error', duration: 1000 });
      });
  }
});
