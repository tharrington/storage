angular.module('fencesForBusiness.login_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('LoginCtrl', function($scope, $rootScope, $state, Auth, $ionicHistory, fencesLocations, $localStorage) {
  // TODO: Check this
  $scope.locationServicesDisabled = false; 
  $scope.hasErrors = false;
  $scope.errorMessage = '';
  $scope.user = {};

  $scope.user.password = "Storage1";
  
  $scope.login = function(form) {
  	$scope.submitted = true;
    console.log('### logging in');

    $rootScope.isStaging = false;
    $localStorage.isStaging = false;
    $scope.submitted = true;

    $rootScope.isTraining = false;
    $localStorage.isTraining = false;

  	if(form.$valid) {
  		Auth.login($scope.user)
      .then( function() {
      	fencesLocations.startLocation();
        $ionicHistory.nextViewOptions({ disableBack: true });
        $state.go('app.drivers');

      })
      .catch( function(err) {
        $scope.hasErrors = true;
        if(err) {
          $scope.errorMessage = err.message;
        }
      });
  	}
  };

  $scope.loginSandbox = function(form) {
    $rootScope.isStaging = true;
    $localStorage.isStaging = true;
    $scope.submitted = true;

    $rootScope.isTraining = false;
    $localStorage.isTraining = false;

    if(form.$valid) {
      Auth.login($scope.user)
      .then( function() {
        fencesLocations.startLocation();
        $ionicHistory.nextViewOptions({ disableBack: true });
        $state.go('app.drivers');
      })
      .catch( function(err) {
        $scope.hasErrors = true;
        if(err) {
          $scope.errorMessage = err.message;
        }
      });
    }
  };
});

