angular.module('fencesForBusiness.supplies_ctrl', ['ngIOS9UIWebViewPatch'])


/**
 * Supplies - A User will type in a text string, most likely customer name and the server will find 
 * results. Display all relevant Orders.
 */
.controller('SuppliesCtrl', function($scope, $ionicLoading, OrderInvoiceService, $ionicPopup, $rootScope, $state, fencesData, $ionicModal, $ionicHistory) {
	$scope.order = {};


	$scope.saveSupplies = function() {
		$ionicLoading.show({ template : 'Saving...' });
		fencesData.postInfo('/orders/' + $scope.order._id, 'PUT', $scope.order).then(function(result) {
      $ionicLoading.show({template : 'Order Saved', duration: 500});
      $ionicHistory.nextViewOptions({ disableBack: true });
      $state.go('app.supplies-lookup');
    });
	};

	$scope.$on('$ionicView.enter', function(e) {
		$scope.order = OrderInvoiceService.getOrderInvoice();

		if(!$scope.order || !$scope.order._id) {
			$ionicHistory.nextViewOptions({ disableBack: true });
			$state.go('app.supplies-lookup');
		}
	});

	$scope.incrementField = function(field_name, value) {
  	if(value == 1) {
	  	$scope.order[field_name] = $scope.order[field_name] + value; 
  	}

  	if($scope.order[field_name] > 0 && value == -1) {
	  	$scope.order[field_name] = $scope.order[field_name] + value; 
  	}
  }
});
