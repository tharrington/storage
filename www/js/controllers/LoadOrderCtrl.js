angular.module('fencesForBusiness.load_order_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('LoadOrderCtrl', function($scope, $window, $ionicPopup, $cordovaInAppBrowser, $interval, $localStorage, $ionicActionSheet, $rootScope, $state, fencesData, $stateParams, $ionicModal, $ionicHistory) {
  $scope.order_status;

	$scope.orderUpdates = [
    { warehouseStatus : 'Unloaded' },
		{ warehouseStatus : 'Pulled' },
    { warehouseStatus : 'Loaded' },
    { warehouseStatus : 'Loaded - Incomplete' },
    { warehouseStatus : 'Missing' }
  ];

  /**
   * Get the order
   */
  $scope.order = {};
  $scope.invoice = {};

  $scope.images = ['http://a3.files.biography.com/image/upload/c_fill,cs_srgb,dpr_1.0,g_face,h_300,q_80,w_300/MTE5NDg0MDU1MTIyMTE4MTU5.jpg', 
  'http://cp91279.biography.com/BIO_Bio-Shorts_Michael-Jordan-Mini-Biography_0_181278_SF_HD_768x432-16x9.jpg'];
  

  fencesData.callWrapper('/orders/getOrder/getInvoice/' + $stateParams.id, 'GET', null).then(function(result) {
    console.log('####### INVOICE: ' + JSON.stringify(result.invoice));
    $scope.order = result.order;
    $scope.invoice = result.invoice;
  });

  /**
   * Sends a status update, depending on current status.
   */ 
  $scope.sendUpdate = function() {
    if($scope.order && $scope.order._id) {
      fencesData.postInfo('/orders/' + $scope.order._id, 'PUT', $scope.order).then(function(result) {
        $scope.load_status = result.loadStatus;
        var alertPopup = $ionicPopup.alert({
          title: 'Order Saved.',
          template: 'Load Status Updated.'
        });
      });
    }
  };
});
