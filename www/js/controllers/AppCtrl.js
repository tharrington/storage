angular.module('fencesForBusiness.app_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('AppCtrl', function($scope, $localStorage, fencesData, $ionicHistory, $state) {
  
  $scope.$on('$ionicView.enter', function(e) {
  });

  $scope.logout = function() {
  	$localStorage.token = null;
  	$ionicHistory.nextViewOptions({ disableBack: true });
		$state.go('app.login');	
  }
})
