angular.module('fencesForBusiness.warehouse_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('WarehouseCtrl', function($scope, $rootScope, $ionicPopup, $ionicHistory, $interval, $localStorage, $log, fencesData, $ionicLoading, $state) {
    $scope.user = $localStorage.user;

  $scope.dispatches = [];
  $scope.getDispatches = function() {
    $ionicLoading.show({ template: 'Loading dispatches...' });

    var myMoment = moment();
    myMoment.hours(0).minutes(0).seconds(0);
    var myDate = new Date(myMoment);

    fencesData.callWrapper('/dispatches/drivers/getAllDriverDispatches/' + myDate, 'GET', null).then(function(result) {
      $ionicLoading.hide();
      $scope.dispatches = result;
    })
    .finally(function() {
      $ionicLoading.hide();
    });
  };

  $scope.$on('$ionicView.enter', function(e) {
    $scope.user = $localStorage.user;
    $scope.getDispatches();
  });

  $scope.displayDate = function(dispatch) {
    return moment(dispatch.dispatchDate).add(1, 'days').format('dddd, MMMM Do');
  };

  $scope.viewDispatch = function(dispatch) {
    $ionicLoading.hide();
    $state.go('app.load_dispatch', { id : dispatch._id });
  };
});
