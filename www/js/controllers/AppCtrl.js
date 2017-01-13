angular.module('fencesForBusiness.app_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('AppCtrl', function($scope, $localStorage, fencesData, $ionicHistory, $state) {
  
  $scope.isSandbox = false;

  $scope.$on('$ionicView.enter', function(e) {
    if($localStorage.isStaging) {
      $scope.isSandbox = true;
    } else {
      $scope.isSandbox = false;
    }
  });

  $scope.logout = function() {
  	$localStorage.token = null;
  	$ionicHistory.nextViewOptions({ disableBack: true });
		$state.go('app.login');	
  }

  $scope.viewDispatches = function() {
  	console.log('#### VIEW DISPATCHES!');
  	$ionicHistory.nextViewOptions({ disableBack: true });
    $state.go('app.past');
  };
})
