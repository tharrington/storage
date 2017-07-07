angular.module('fencesForBusiness.load_order_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('LoadOrderCtrl', function($scope, $sce, $window, $ionicPopup, $cordovaInAppBrowser, $interval, $localStorage, $ionicActionSheet, $rootScope, $state, fencesData, $stateParams, $ionicModal, $ionicHistory) {
  $scope.order_status;

	$scope.orderUpdates = [
    { warehouseStatus : 'Not Loaded' },
		{ warehouseStatus : 'Pulled' },
    { warehouseStatus : 'Pulled - Incomplete'},
    { warehouseStatus : 'Loaded' },
    { warehouseStatus : 'Loaded - Incomplete' },
    { warehouseStatus : 'Loaded - Last Order on Truck' },
    { warehouseStatus : 'Missing' }
  ];
  $scope.user = $localStorage.user;

  /**
   * Get the order
   */
  $scope.order = {};
  $scope.invoice = {};
  $scope.images = [];
  $scope.pickup = {};

  fencesData.callWrapper('/orders/getOrder/getInvoice/' + $stateParams.id, 'GET', null).then(function(result) {
    $scope.order = result.orders.Delivery;
    $scope.pickup = result.orders.Pickup;
    $scope.invoices = result.invoices;
    console.log('### got result: ' + JSON.stringify(result));

    if(result.invoices && result.invoices.length > 0) {
      var items = [];
      var images = [];

      result.invoices.forEach(function(inv) {
        if(inv.invoice_type == 'Storage Goods') {
          $scope.invoice = inv;
          
          var total_items = 0;
          inv.items.forEach(function(item) {
            if(item.type == 'Storage Goods') {
              total_items = total_items + item.quantity;
              items.push(item);
            }
          });
          $scope.total_invoice_items = total_items;

          inv.imageURLs.forEach(function(item) {
            images.push(item);
          });

          $scope.invoice = inv;
          $scope.invoice.imageURLs = images;
          $scope.invoice.items = items;
        } else if(inv.invoice_type == 'Shipping') {
          $scope.shipping_invoice = inv;
        }
      });

      if($scope.shipping_invoice && $scope.shipping_invoice._id) {
        var total_shipping_items = 0;
        $scope.shipping_invoice.items.forEach(function(item) {
          total_shipping_items = total_shipping_items + item.quantity;
        });
        $scope.total_shipping_items = total_shipping_items;
      }
      

      
    }
  });

  /**
   * Sends a status update, depending on current status.
   */ 
  $scope.sendUpdate = function() {
    if($scope.order.warehouseStatus == 'Loaded - Incomplete' && 
      (!$scope.order.warehouse_notes || $scope.order.warehouse_notes.trim().length == 0)) {
      var alertPopup = $ionicPopup.alert({
        title: 'NOT SAVED',
        template: 'You must enter notes for incomplete orders orders.'
      });
    } else {

      if($scope.order && $scope.order._id) {
        fencesData.postInfo('/orders/' + $scope.order._id, 'PUT', $scope.order).then(function(result) {
          $scope.load_status = result.loadStatus;
          var alertPopup = $ionicPopup.alert({
            title: 'Order Saved.',
            template: 'Load Status Updated.'
          });
        });
      }
    }
  };
});
