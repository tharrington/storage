angular.module('fencesForBusiness.past_dispatches_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('PastDispatchesCtrl', function($scope, $rootScope, $ionicPopup, $ionicHistory, $interval, $localStorage, $log, fencesData, $ionicLoading, $state) {
  $scope.getOrders = function() {
    $scope.dispatch = {};
    $ionicLoading.show({ template: 'Loading dispatch...' });

    // GET ALL MY DISPATCHES!!!

    $ionicLoading.hide();
  };

  $scope.$on('$ionicView.enter', function(e) {
    $scope.getOrders();
  });

  $scope.viewOrder = function(order) {
    $ionicLoading.hide();
    $state.go('app.orders', { id : order._id });
  };
});
