angular.module('fencesForBusiness.past_dispatches_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('PastDispatchesCtrl', function($scope, $rootScope, $ionicPopup, $ionicHistory, $interval, $localStorage, $log, fencesData, $ionicLoading, $state) {
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
    $scope.getDispatches();
  });

  $scope.viewDispatch = function(dispatch) {
    $ionicLoading.hide();
    $state.go('app.past_dispatch', { id : dispatch._id });
  };
});
