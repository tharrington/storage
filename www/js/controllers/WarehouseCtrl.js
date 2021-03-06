angular.module('fencesForBusiness.warehouse_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('WarehouseCtrl', function($scope, $rootScope, Auth, $ionicPopup, $ionicHistory, $interval, $localStorage, $log, fencesData, $ionicLoading, $state) {
  $scope.selected_truck = {};
  $scope.drivers = [];
  $scope.dispatches = [];
  $scope.user = {};
  $scope.driverName;

  $scope.getDispatches = function() {
    var myMoment = moment();
    myMoment.hours(0).minutes(0).seconds(0);
    var myDate = new Date(myMoment);

    fencesData.callWrapper('/dispatches/drivers/getAllDriverDispatches/' + myDate, 'GET', null).then(function(result) {
      $ionicLoading.hide();
      $scope.dispatches = result;


      if($scope.dispatches && $scope.dispatches.length > 4) {
        $scope.dispatches = $scope.dispatches.splice(0,5);
      }

      $scope.dispatches.forEach(function(dispatch) {
        var delivery_count = 0;
        console.log('### dispatch order: ' + JSON.stringify(dispatch.orders));
        dispatch.orders.forEach(function(order) {
          console.log('### order type: ' + order.type);
          if(order.type == 'Delivery') {
            delivery_count++;
          }
        });
        console.log('### delivery_count: ' + delivery_count);
        dispatch.delivery_count = delivery_count;
      });
    })
    .finally(function() {
    });
  };

  $scope.findTrucks = function() {
    fencesData.callWrapper('/users/driversByRegion' , 'GET', null)
      .then(function(results) {
        $scope.drivers = results;
      }, function(err) {
        $ionicLoading.show({ template: 'There was an error', duration: 1000 });
      });
  }


  $scope.$on('$ionicView.enter', function(e) {
    $scope.user = $localStorage.user;
    
    if($scope.user) {
      $scope.driverName = $scope.user.name;
      $scope.getDispatches();
      $scope.findTrucks();
    } else {
      $scope.findTrucks();
    }
  });

  $scope.switch_truck = function() {
    console.log('### switch: ' + $scope.driverName);

    $scope.drivers.forEach(function(entry) {
      if(entry.name == $scope.driverName) {
        console.log('### logging in: ' + JSON.stringify(entry));
        $scope.user = entry;
        $scope.user.password = 'Storage1';

        Auth.login($scope.user)
          .then( function() {
            $localStorage.lastTruckLogin = moment();
            $scope.user = $localStorage.user;
            console.log('## switching user: ' + JSON.stringify($scope.user));
            $scope.getDispatches();

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
});
