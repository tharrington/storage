angular.module('fencesForBusiness.login_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('LoginCtrl', function($scope, $rootScope, $state, Auth, $ionicHistory, fencesLocations, $localStorage) {
  // TODO: Check this
  $scope.locationServicesDisabled = false;
  $scope.hasErrors = false;
  $scope.errorMessage = '';
  $scope.user = {};

  $scope.showTerms = function() {

  };

  $scope.login = function(form) {
  	$scope.submitted = true;

  	if(form.$valid) {
  		Auth.login($scope.user)
      .then( function() {
      	fencesLocations.startLocation();
        $ionicHistory.nextViewOptions({ disableBack: true });
	  		$state.go('app.orders');
      })
      .catch( function(err) {
        $scope.hasErrors = true;
  			$scope.errorMessage = err.message;
      });
  	}
  };

  $scope.loginSandbox = function(form) {
    $rootScope.isStaging = true;
    $localStorage.isStaging = true;
    $scope.submitted = true;

    if(form.$valid) {
      Auth.login($scope.user)
      .then( function() {
        fencesLocations.startLocation();
        $ionicHistory.nextViewOptions({ disableBack: true });
        $state.go('app.orders');
      })
      .catch( function(err) {
        $scope.hasErrors = true;
        $scope.errorMessage = err.message;
      });
    }
  };
});

