angular.module('fencesForBusiness.time_cards_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('TimeCardsController', function($scope, OrderInvoiceService, $ionicLoading, $state, fencesData, $stateParams, $rootScope, $ionicHistory) {

  $scope.$on( "$ionicView.leave", function( scopes ) { });

  $scope.$on( "$ionicView.enter", function( scopes ) {
    $scope.errorMessage = '';
    $scope.hasErrors    = false;
    $scope.loadPunches();
  });

  $scope.loadPunches = () => {
    $ionicLoading.show({ template: 'Loading Time Cards...' });
    fencesData.callWrapper('/users/punches', 'GET', null)
    .then(function(punches) {
      $ionicLoading.hide();
      $scope.punches = punches;
    }, function(err) {
      $ionicLoading.show({ template: 'There was an error', duration: 1000 });
    });
  }

  $scope.formatDate = function(date) {
    if (!date) {
      return null;
    }
    return moment.utc(date).format('M/D/YY');
  }

  $scope.formatTime = function(date) {
    if (!date) {
      return null;
    }
    return moment.utc(date).format('h:mm a');
  }

  $scope.formatHours = function(minutes) {
    if (typeof minutes != 'number') {
      return null
    }
    return (minutes / 60).toFixed(2)
  }

});
