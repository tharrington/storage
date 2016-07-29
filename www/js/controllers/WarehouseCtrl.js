angular.module('fencesForBusiness.warehouse_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('WarehouseCtrl', function($scope, $rootScope, $ionicPopup, $ionicHistory, $interval, $localStorage, $log, fencesData, $ionicLoading, $state) {
  

  $scope.dispatches = [];
  $scope.getDispatches = function() {
    $ionicLoading.show({ template: 'Loading dispatches...' });

    fencesData.callWrapper('/dispatches/drivers/getAllDriverDispatches', 'GET', null).then(function(result) {
      $ionicLoading.hide();
      $scope.dispatches = result;
    })
    .finally(function() {
      $ionicLoading.hide();
    });
  };

  $scope.$on('$ionicView.enter', function(e) {
    $scope.getDispatches();
  });

  $scope.viewDispatch = function(dispatch) {
    $ionicLoading.hide();
    $state.go('app.load_dispatch', { id : dispatch._id });
  };
});
