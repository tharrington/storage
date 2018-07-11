angular.module('fencesForBusiness.load_dispatch_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('LoadDispatchCtrl', function($scope, OrderInvoiceService, $ionicPopup, $localStorage, fencesData, $ionicLoading, $state, $stateParams) {
  $scope.dispatch  = {};

  $scope.loadedOrders = [];
  $scope.missingOrders = [];
  $scope.pulledOrders = [];
  $scope.loading = true;

  $scope.user = $localStorage.user;
  
  $scope.options = [
    { name: '', value: '--' , type:"None"}, 

    { name: 'Servicing', value: 'Servicing' , type:"WAREHOUSE STATUS"}, 
    { name: 'Pulled', value: 'Pulled', type:"WAREHOUSE STATUS" }, 
    { name: 'Pulled Partial', value: 'Pulled Partial' , type:"WAREHOUSE STATUS"},
    { name: 'Cannot Find All', value: 'Cannot Find All', type:"WAREHOUSE STATUS" },
    { name: 'Missing', value: 'Missing All' , type:"TRUCK STATUS"}, 
    { name: 'Partially Loaded', value: 'Partially Loaded', type:"TRUCK STATUS" }, 
    { name: 'Loaded - Last on Truck', value: 'Loaded - Last on Truck' , type:"TRUCK STATUS"},
    { name: 'Loaded', value: 'Loaded', type:"TRUCK STATUS" }
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

  $scope.setDispatchStatus = function(status) {
    $scope.dispatch.warehouseStatus = status;
    console.log('### setting status: ' + status);
    fencesData.postInfo('/dispatches/' + $scope.dispatch._id, 'PATCH', $scope.dispatch).then(function(result) {
    });
  }

  $scope.completeOrder = function(appointment, event) {
    appointment.warehouseStatus = "Loaded";

    fencesData.postInfo('/orders/' + appointment._id, 'PUT', appointment).then(function(result) {
      $scope.getDispatch();
      fencesData.callWrapper('/invoices/getOrderAndInvoice/' + appointment.ssOrderId, 'GET', null)
        .then(function(result) {
          $scope.saveInvoices(result.invoices, 'Loaded');
        }, function(err) {
          $ionicLoading.show({ template: 'There was an error', duration: 1000 });
        }); 
    });

    event.preventDefault(); 
    event.stopPropagation();
  }


  $scope.saveInvoices = function(invoices, status) {    
    invoices.forEach(function(entry) {
      entry.warehouseStatus = status;
      entry.items.forEach(function(item) {
        if(item.type == 'Storage Goods' && item.warehouseStatus != 'Delivered') {
          item.warehouseStatus = status;
        }
      });
      if(entry.invoice_type == 'Storage Goods') {
        console.log('### saving invoices = ' + JSON.stringify(entry));
        $ionicLoading.show({template : 'Complete', duration: 500});
        fencesData.callWrapper('/invoices/' + entry._id, 'PUT', entry).then(function(result) {
          $ionicLoading.show({template : 'Complete', duration: 500});
        }, function(err) {
          $ionicLoading.show({ template: 'There was an error', duration: 1000 });
        });
      }
    });
    
  }

  $scope.setOrderStatus = function(appointment) {
    $ionicLoading.show({ template : 'Saving Status' });
    console.log('### saving order: ' + JSON.stringify(appointment));

    fencesData.postInfo('/orders/' + appointment._id, 'PUT', appointment).then(function(result) {
      $scope.getDispatch();
      if(appointment.warehouseStatus == 'Partially Loaded') {
        $ionicLoading.hide();
        $state.go('app.missing-items', { id : appointment.ssOrderId });
      } else {
        fencesData.callWrapper('/invoices/getOrderAndInvoice/' + appointment.ssOrderId, 'GET', null)
          .then(function(result) {
            if(appointment.warehouseStatus == 'Loaded' || appointment.warehouseStatus == 'Loaded - last on truck') {
              $scope.saveInvoices(result.invoices, 'Loaded');
            } else if(appointment.warehouseStatus == 'Missing') {
              $scope.saveInvoices(result.invoices, 'Missing');
            } else if(appointment.warehouseStatus == 'Pulled') {
              $scope.saveInvoices(result.invoices, 'Pulled');
            } else {
              $ionicLoading.hide();
            }
          }, function(err) {
            $ionicLoading.show({ template: 'There was an error', duration: 1000 });
          });
      
      } 
    }, function(err) {
      console.log('### err: ' + JSON.stringify(err));
      $ionicLoading.show({ template: 'There was an error', duration: 1000 });
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
    $scope.loading = true;


    fencesData.callWrapper('/dispatches/getDispatch/' + $stateParams.id, 'GET', null).then(function(result) {
      $scope.dispatch = result;

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

      $scope.loading = false;

      if($scope.pulledOrders && $scope.pulledOrders.length == 0) {
        $scope.setDispatchStatus('Loaded');
      }
    });
  };

  $scope.$on('$ionicView.enter', function(e) {
    $scope.getDispatch();
  });

  $scope.navigateToOrder = function(order) {
    var currentState = $state.current.name;

    OrderInvoiceService.setOrderInvoice(order);
    if(currentState == 'app.supplies-lookup') {
      $state.go('app.supplies', { id : order.ssOrderId });
    } else {
      $state.go('app.order_summary', { id : order.ssOrderId, fromWarehouse : true });
    }
  };

  $scope.editMissingOrder = function(order, event) {
    $state.go('app.missing-items', { id : order.ssOrderId });
    event.preventDefault();
    event.stopPropagation();
  };
});
