angular.module('fencesForBusiness.past_dispatch_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('PastDispatchCtrl', function($scope, $ionicPopup, fencesData, $ionicLoading, $state, $stateParams) {
  $scope.dispatch  = {};

  $scope.substringField = function(value) {
    if(!value) return 'Not declared';
    if(value.length < 10) return value;
    return value.substring(0, 10);
  }
  
  $scope.getDispatch = function() {
    $ionicLoading.show({ template: 'Loading dispatches...' });

    fencesData.callWrapper('/dispatches/getDispatch/' + $stateParams.id, 'GET', null).then(function(result) {
      $ionicLoading.hide();
      $scope.dispatch = result;
    });
  };

  $scope.$on('$ionicView.enter', function(e) {
    $scope.getDispatch();
  });

  // $scope.viewOrder = function(order) {
  //   $ionicLoading.hide();
  //   console.log("#### VIEW ORDERS");
  //   fencesData.setDispatch($scope.dispatch);
  //   $state.go('app.orders', { id : order._id });
  // };
});
