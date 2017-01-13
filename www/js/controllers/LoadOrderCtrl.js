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

  fencesData.callWrapper('/orders/getOrder/getInvoice/' + $stateParams.id, 'GET', null).then(function(result) {
    console.log('### result: ' + JSON.stringify(result));
    $scope.order = result.order;
    $scope.invoiceURL = $sce.trustAsResourceUrl("http://storage-squad-image.na34.force.com/ssimages?id=" + result.order.ssOrderId);
    $scope.invoice = result.invoice;
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
