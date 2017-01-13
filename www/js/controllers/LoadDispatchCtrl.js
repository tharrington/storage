angular.module('fencesForBusiness.load_dispatch_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('LoadDispatchCtrl', function($scope, $ionicPopup, $localStorage, fencesData, $ionicLoading, $state, $stateParams) {
  $scope.dispatch  = {};

  $scope.dispatchUpdates = [
    { warehouseStatus : 'Not Loaded' },
    { warehouseStatus : 'In Progress' },
    { warehouseStatus : 'Loaded' }
  ];

  $scope.user = $localStorage.user;
  
  $scope.orderUpdates = [
    { warehouseStatus : 'Not Loaded' },
    { warehouseStatus : 'Pulled' },
    { warehouseStatus : 'Pulled - Incomplete'},
    { warehouseStatus : 'Loaded' },
    { warehouseStatus : 'Loaded - Incomplete' },
    { warehouseStatus : 'Loaded - Last Order on Truck' },
    { warehouseStatus : 'Missing' }
  ];

  $scope.displayDate = function(dispatch) {
    return moment(dispatch.dispatchDate).add(1, 'days').format('dddd, MMMM Do');
  };
  
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

      var orders = [];
      result.orders.forEach(function(entry) {
        var dispatchDate = moment.utc($scope.dispatch.dispatchDate);
        var delDate = moment.utc(entry.deliveryDate);
        if(dispatchDate.isSame(delDate, 'day') && entry.type == 'Delivery') {
        // if(dispatchDate.isSame(delDate, 'day')) {
          orders.push(entry);
        }
      });
      $scope.dispatch.orders = orders;
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
