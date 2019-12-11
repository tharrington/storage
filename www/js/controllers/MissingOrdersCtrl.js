angular.module('fencesForBusiness.missing_orders_ctrl', ['ngIOS9UIWebViewPatch'])



.controller('MissingOrdersCtrl', function($scope, $location, OrderInvoiceService, $timeout, $sce, $ionicLoading, $rootScope, $state, fencesData, $stateParams) {
  $scope.orders = [];

  $scope.$on( "$ionicView.enter", function( scopes ) {
    fencesData.callWrapper('/orders/missingOrders/missing', 'GET', null)
      .then(function(result) {

        console.log('### got orders: ' + JSON.stringify(result));
        $scope.orders = result;
      });
  });
});
  