angular.module('fencesForBusiness.drivers_ctrl', ['ngIOS9UIWebViewPatch'])

/**
 * Drivers Controller - Login as a driver or complete the tutorial
 */
.controller('DriversCtrl', function($scope, mockFencesData, $rootScope, $ionicHistory, $ionicPopup, $localStorage, fencesData, $ionicLoading, Auth, $state, $stateParams) {
  $scope.title = "Complete Training";
  $scope.currentUser = {};
  $scope.drivers = [];

  $scope.loading = true;


  $scope.$on('$ionicView.enter', function(e) {
    $rootScope.isTraining = false;
    $scope.isTraining = false;
    $rootScope.trainingInProgress = false;

    $scope.loading = true;
    $scope.currentUser = $localStorage.mover;

    if($scope.currentUser && $scope.currentUser.tutorialCompleted) {
      $scope.title = "Select Truck";
      fencesData.callWrapper('/users/driversByRegion' , 'GET', null)
        .then(function(results) {
          $scope.drivers = results;
          $scope.loading = false;
        }, function(err) {
          $ionicLoading.show({ template: 'There was an error', duration: 1000 });
        });
    } else {
      $scope.loading = false;
    }
  });

  $scope.loginAsUser = function(user) {
    user.password = 'Storage1';

    if($scope.isTraining) {
      $ionicHistory.nextViewOptions({ disableBack: true });
      $localStorage.lastTruckLogin = moment();
      $localStorage.user = user;
      $rootScope.trainingInProgress = true;
      $state.go('app.orders');
    } else {
      Auth.login(user)
        .then( function() {
          $ionicHistory.nextViewOptions({ disableBack: true });
          $localStorage.lastTruckLogin = moment();
          $state.go('app.orders');
        })
        .catch( function(err) {
          $scope.hasErrors = true;
          $scope.errorMessage = err.message;
        });
    }
  }

  $scope.doTutorial = function() {
    $rootScope.isTraining = true;
    $scope.isTraining = true;

    mockFencesData.init().then(function() {
      fencesData.callWrapper('/users/driversByRegion' , 'GET', null)
        .then(function(results) {
          $scope.drivers = results;
        }, function(err) {
          $ionicLoading.show({ template: 'There was an error', duration: 1000 });
        });
    });
  }
});
