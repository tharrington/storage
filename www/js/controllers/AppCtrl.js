angular.module('fencesForBusiness.app_ctrl', ['ngIOS9UIWebViewPatch'])
/**
 * This is the main app controller.
 */
.controller('AppCtrl', function($scope, $localStorage, fencesData, $ionicHistory, $state) {
  $scope.isSandbox = false;

  $scope.$on('$ionicView.enter', function(e) {
    if($localStorage.isStaging) {
      $scope.isSandbox = true;
    } else {
      $scope.isSandbox = false;
    }
    $scope.user = $localStorage.user;
    $scope.mover = $localStorage.mover;
  });

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
