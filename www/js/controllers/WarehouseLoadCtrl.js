angular.module('fencesForBusiness.warehouse_load_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('WarehouseLoadCtrl', function($scope, $rootScope, Auth, $ionicPopup, $ionicHistory, $interval, $localStorage, $log, fencesData, $ionicLoading, $state) {
  $scope.selected_truck = {};
  $scope.drivers = [];
  $scope.dispatch = {};
  $scope.completedOrders = [];
  $scope.warehousedOrders = [];
  $scope.user = {};
  $scope.driverName;

  $scope.findTrucks = function() {
    fencesData.callWrapper('/users/driversByRegion' , 'GET', null)
      .then(function(results) {
        $scope.drivers = results;
        if(results && results.length > 0 && !$scope.driverName) {
          $scope.driverName = results[0].name;
        }
        $scope.switch_truck();
      }, function(err) {
        $ionicLoading.show({ template: 'There was an error', duration: 1000 });
      });
  }


  $scope.$on('$ionicView.enter', function(e) {
    $scope.user = $localStorage.user;
    $scope.completedOrders = [];
    $scope.warehousedOrders = [];

    if($scope.user) {
      $scope.driverName = $scope.user.name;
      $scope.findTrucks();
    } else {
      $scope.findTrucks();
    }
  });

  $scope.organizeOrders = function() {
    fencesData.getTodaysDispatch().then(function(result) {
      $scope.dispatch = result;
      $rootScope.dispatch = result;
      $ionicLoading.hide();

      if($scope.dispatch && $scope.dispatch.orders) {
        $scope.total_orders = 0;
        $scope.dispatch.orders.forEach(function(entry) {
          var today = moment();
          var delDate = moment(entry.deliveryDate).add(3, 'h');

          // Make sure the order date is the same day as the current date.
          if(today.isSame(delDate, 'day')) {
            $scope.total_orders++;
            if(entry.type == 'Pickup' && entry.status == 'Complete' && !entry.warehouseLocation) {
              $scope.completedOrders.push(entry);
            } else if(entry.type == 'Pickup' && entry.status == 'Complete' && entry.warehouseLocation) {
              $scope.warehousedOrders.push(entry);
            } 
          }

        });
      }
      $scope.loading = false;
    }).finally(function() {
      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete');
    });;
  }

  $scope.switch_truck = function() {
    $scope.completedOrders = [];
    $scope.warehousedOrders = [];

    $scope.drivers.forEach(function(entry) {
      if(entry.name == $scope.driverName) {
        $scope.user = entry;
        $scope.user.password = 'Storage1';

        Auth.login($scope.user)
          .then( function() {
            $localStorage.lastTruckLogin = moment();
            $scope.user = $localStorage.user;
            $scope.organizeOrders();
          })
          .catch( function(err) {
            $scope.hasErrors = true;
            $scope.errorMessage = err.message;
          });
      }
    });
  }

  $scope.displayDate = function(dispatch) {
    return moment(dispatch.dispatchDate).add(1, 'days').format('dddd, MMMM Do');
  };

  $scope.viewDispatch = function(dispatch) {
    $ionicLoading.hide();
    if(dispatch && dispatch.orders && dispatch.orders.length > 0) {
      $state.go('app.load_dispatch', { id : dispatch._id });
    }
  };

  $scope.viewCompletedAppointment = function(appointment) {
    $state.go('app.order_summary', { id : appointment.ssOrderId });
  };
});
