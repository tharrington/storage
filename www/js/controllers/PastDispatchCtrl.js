angular.module('fencesForBusiness.past_dispatch_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('PastDispatchCtrl', function($scope, $rootScope, $ionicPopup, $ionicHistory, $interval, $localStorage, $log, fencesData, $ionicLoading, $state) {
  function organizeOrders() {
    var date;
    fencesData.getDispatch(date).then(function(result) {
      $scope.dispatch = result;
      $rootScope.dispatch = result;
      $ionicLoading.hide();
    }).finally(function() {
      $log.info('Hit finally');
      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete');
    });;
  }

  $scope.getOrders = function() {
    $scope.dispatch = {};
    $ionicLoading.show({ template: 'Loading dispatch...' });
    organizeOrders();
  };

  $scope.$on('$ionicView.enter', function(e) {
    $scope.getOrders();
  });

  $scope.viewOrder = function(order) {
    $ionicLoading.hide();
    $state.go('app.orders', { id : order._id });
  };
});
