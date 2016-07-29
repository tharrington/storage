angular.module('fencesForBusiness.load_dispatch_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('LoadDispatchCtrl', function($scope, $ionicPopup, fencesData, $ionicLoading, $state, $stateParams) {
  $scope.dispatch  = {};

  $scope.dispatchUpdates = [
    { warehouseStatus : 'Unloaded' },
    { warehouseStatus : 'In Progress' },
    { warehouseStatus : 'Loaded' }
  ];

  $scope.orderUpdates = [
    { warehouseStatus : 'Unloaded' },
    { warehouseStatus : 'Pulled' },
    { warehouseStatus : 'Loaded' },
    { warehouseStatus : 'Loaded - Incomplete' },
    { warehouseStatus : 'Missing' }
  ];

  $scope.setDispatchStatus = function() {
    fencesData.postInfo('/dispatches/' + $scope.dispatch._id, 'PATCH', $scope.dispatch).then(function(result) {
      var alertPopup = $ionicPopup.alert({
        title: 'Dispatch Saved.',
        template: 'Dispatch Updated'
      });
    });
  }

  $scope.setOrderStatus = function(appointment) {
    fencesData.postInfo('/orders/' + appointment._id, 'PUT', appointment).then(function(result) {
      var alertPopup = $ionicPopup.alert({
        title: 'Order Saved.',
        template: 'Order Updated'
      });
    });
  }

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

  $scope.viewOrder = function(order) {
    fencesData.setOrder(order);
    $state.go('app.load_order');
  };
});
