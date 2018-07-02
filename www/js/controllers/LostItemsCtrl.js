angular.module('fencesForBusiness.lost_items_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('LostItemsCtrl', function($scope, OrderInvoiceService, $ionicLoading, $state, fencesData, $stateParams, $ionicModal) {

  console.log('### query for pickup disptach...');
  $scope.orders = [];
  fencesData.callWrapper('/orders/getDispatchOrdersBySSOrderId/' + $stateParams.id, 'GET', null).then(function(result) {
    console.log('### result: ' + JSON.stringify(result));
    $scope.orders = result;
  });


  fencesData.callWrapper('/invoices/getOrderAndInvoice/' + $stateParams.id, 'GET', null)
    .then(function(result) {
      $ionicLoading.hide();
      $scope.pickup = result.Pickup;
      $scope.delivery = result.Delivery;
      console.log('### order result: ' + JSON.stringify(result));
    });


  $scope.saveNotes = function() {
    $ionicLoading.show({ template: 'Saving' });

    if($scope.delivery.warehouseLocation && !$scope.pickup.warehouseLocation) {
      $scope.pickup.warehouseNotes = $scope.delivery.warehouseNotes;
      $scope.pickup.warehouseLocation = $scope.delivery.warehouseLocation;
    } else if($scope.pickup.warehouseLocation) {
      $scope.delivery.warehouseNotes = $scope.pickup.warehouseNotes;
      $scope.delivery.warehouseLocation = $scope.pickup.warehouseLocation;
    }

    fencesData.callWrapper('/orders/' + $scope.pickup._id, 'PUT', $scope.pickup)
      .then(function(result) {
        $ionicLoading.show({ template: 'Order Saved.', duration: 1000 });
      });
    fencesData.callWrapper('/orders/' + $scope.delivery._id, 'PUT', $scope.delivery)
      .then(function(result) {
        $ionicLoading.show({ template: 'Order Saved.', duration: 1000 });
      });
  }

});