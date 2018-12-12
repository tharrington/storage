angular.module('fencesForBusiness.shipping_today_ctrl', ['ngIOS9UIWebViewPatch'])



.controller('ShippingTodayCtrl', function($scope, $location, OrderInvoiceService, $timeout, $sce, $ionicLoading, $rootScope, $state, fencesData, $stateParams) {
  $scope.orders = [];

  $scope.$on( "$ionicView.enter", function( scopes ) {
    fencesData.callWrapper('/orders/shippingInfo/today', 'GET', null)
      .then(function(result) {
        console.log('### shipping result: ' + JSON.stringify(result));
        $scope.orders = result;
      });
  });
});
  