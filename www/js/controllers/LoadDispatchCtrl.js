angular.module('fencesForBusiness.load_dispatch_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('LoadDispatchCtrl', function($scope, $ionicPopup, $localStorage, fencesData, $ionicLoading, $state, $stateParams) {
  $scope.dispatch  = {};

  $scope.loadedOrders = [];
  $scope.missingOrders = [];
  $scope.pulledOrders = [];

  $scope.user = $localStorage.user;
  
  $scope.orderUpdates = [
    { warehouseStatus : 'Pulled' },
    { warehouseStatus : 'Partially Loaded' },
    { warehouseStatus : 'Missing' },
    { warehouseStatus : 'Loaded' },
    { warehouseStatus : 'Loaded - last on truck' }
  ];

  $scope.displayDate = function(dispatch) {
    return moment(dispatch.dispatchDate).add(1, 'days').format('dddd, MMMM Do');
  };

  $scope.startLoading = function(status) {
    $scope.dispatch.warehouseStatus = status;
    fencesData.postInfo('/dispatches/' + $scope.dispatch._id, 'PATCH', $scope.dispatch).then(function(result) {
      $scope.getDispatch();
    });
  }
  
  $scope.setDispatchStatus = function() {
    fencesData.postInfo('/dispatches/' + $scope.dispatch._id, 'PATCH', $scope.dispatch).then(function(result) {
      $scope.getDispatch();
    });
  }

  $scope.setOrderStatus = function(appointment) {
    fencesData.postInfo('/orders/' + appointment._id, 'PUT', appointment).then(function(result) {
      $scope.getDispatch();
    });
  }

  $scope.substringField = function(value) {
    if(!value) return 'Not declared';
    if(value.length < 10) return value;
    return value.substring(0, 10);
  }
  
  $scope.getDispatch = function() {
    $scope.loadedOrders = [];
    $scope.missingOrders = [];
    $scope.pulledOrders = [];

    fencesData.callWrapper('/dispatches/getDispatch/' + $stateParams.id, 'GET', null).then(function(result) {
      $scope.dispatch = result;
      console.log('### got dispatch: ' + JSON.stringify(result));
      result.orders.forEach(function(entry) {
        var dispatchDate = moment.utc($scope.dispatch.dispatchDate);
        var delDate = moment.utc(entry.deliveryDate);
        if(dispatchDate.isSame(delDate, 'day') && entry.type == 'Delivery') {

          if(entry.warehouseStatus == 'Loaded' || entry.warehouseStatus == 'Loaded - last on truck' || entry.warehouseStatus == 'Partially Loaded') {
            $scope.loadedOrders.push(entry);
          } else if(entry.warehouseStatus == 'Missing') {
            $scope.missingOrders.push(entry);
          } else {
            $scope.pulledOrders.push(entry);
          }
        }
      });

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
