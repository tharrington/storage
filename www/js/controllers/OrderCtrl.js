angular.module('fencesForBusiness.order_ctrl', ['ngIOS9UIWebViewPatch'])

/**
 * OrderCtrl - view the order details and update the status.
 */
.controller('OrderCtrl', function($scope, $ionicNavBarDelegate, Auth, $window, $ionicPopup, $ionicLoading, $cordovaInAppBrowser, $interval, $localStorage, $ionicActionSheet, $rootScope, $state, fencesData, $stateParams, $ionicModal, $ionicHistory) {
  $scope.order_status;
  $scope.user = $localStorage.user;
  $scope.invoice_items = [];

  $scope.images = [];


	$scope.openInGoogleMaps = function() {
		if($scope.order && $scope.order.position) {
			var lat = parseFloat($scope.order.position.coords.latitude);
			var lng = parseFloat($scope.order.position.coords.longitude);
			var text = $scope.order.building || $scope.order.address;
			launchnavigator.navigate([lat, lng]);
		}
	};

	$scope.openInSalesforce1 = function() {
		var scheme = "com.salesforce.salesforce1://";
		window.open(scheme, '_system', 'location=no');
	};

	$scope.orderUpdates = [
    { status : 'Ok'},
  	{ status : 'Rescheduled' },
    { status : 'No Answer' },
    { status : 'Canceled' }
  ];

  $scope.deliveryUpdates = [
    { status : 'Rescheduled' },
    { status : 'No Answer' },
    { status : 'Complete' }
  ];

  $scope.formatNumber = function(s) {
    var s2 = (""+s).replace(/\D/g, '');
    var m = s2.match(/^(\d{3})(\d{3})(\d{4})$/);
    return (!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3];
  }


  /**
   * Get the order
   */
  fencesData.getOrder($stateParams.id).then(function(result) {
		$scope.order = result;

    if ($scope.order.status == "Complete") {
      $scope.messagePhone = $scope.order.phone;
    } else {
      $scope.messagePhone = $scope.order.proxyPhone;
    }

    if($scope.order.status == 'En Route' || $scope.order.status == 'Arrived' || $scope.order.status == 'Completed'){
      $scope.order.notes = '';
    }
    console.log('### got order: ' + JSON.stringify($scope.order));
    if($scope.order.type == 'Delivery') {
      $scope.orderUpdates = [
        { status : 'Ok' },
        { status : 'Rescheduled' },
        { status : 'No Answer' },
        { status : 'Canceled' },
        { status : 'Complete- Left Unattended' }
      ]
    }
    $scope.order_status = result.status;
	});

  $scope.$on('$ionicView.enter', function(e) {
    $scope.invoice_items = [];
    $scope.images = [];

    Auth.checkLastTruckLogin();
    $ionicNavBarDelegate.showBackButton(true);
    fencesData.getOrder($stateParams.id).then(function(result) {
      $scope.order = result;

      if ($scope.order.status == "Complete") {
        $scope.messagePhone = $scope.order.phone;
      } else {
        $scope.messagePhone = $scope.order.proxyPhone;
      }

      $scope.order_status = result.status;

      if($scope.order.type == 'Delivery') {
        fencesData.callWrapper('/invoices/getOrderAndInvoice/' + $scope.order.ssOrderId, 'GET', null).then(function(result) {

          console.log('### result: ' + JSON.stringify(result));
          $scope.invoices = result.invoices;

          $scope.invoices.forEach(function(inv) {
            inv.imageURLs.forEach(function(img) {
              $scope.images.push({ src : img });
            });
            inv.items.forEach(function(entry) {
              if(entry.type == 'Storage Goods') {
                $scope.invoice_items.push(entry);
              }
            });
          });
          console.log('### invoice items: ' + JSON.stringify($scope.invoice_items));
        });
      }
    });
  });


  /**
   * Complete the invoice
   */

  $scope.completeInvoice = function() {
    $state.go('app.invoice', { id : $scope.order.ssOrderId });
  }

  $scope.changeStatus = function() {
    if($scope.order.status == 'Ok')  {
      $scope.order.status = 'Appointment Scheduled';
      $scope.sendUpdate();
    } else {
      $ionicNavBarDelegate.showBackButton(false);
    }
  }

  /**
   * Sends a status update, depending on current status of the order
   */
  $scope.sendUpdate = function() {
    if(($scope.order.status == 'No Answer' || $scope.order.status == 'Rescheduled' || $scope.order.status == 'Canceled') &&
      (!$scope.order.notes || $scope.order.notes.trim().length == 0)) {
      var alertPopup = $ionicPopup.alert({
        title: 'NOT SAVED',
        template: 'You must enter notes for rescheduled orders.'
      });
      alertPopup.then(function(res) { });
    } else {

      if($scope.order && $scope.order._id) {

        if($scope.order.status == 'No Answer') {
          $scope.order.status = 'Rescheduled';

          if($scope.order.notes.indexOf('No Answer') == -1) {
            $scope.order.notes = 'No Answer - ' + $scope.order.notes;
          }
        } else if($scope.order.status == 'Rescheduled'){
          if($scope.order.notes.indexOf('Rescheduled') == -1) {
            $scope.order.notes = 'Rescheduled - ' + $scope.order.notes;
          }
        } else if($scope.order.status == 'Canceled'){
          if($scope.order.notes.indexOf('Canceled') == -1) {
            $scope.order.notes = 'Canceled - ' + $scope.order.notes;
          }
        }
        else{
          $scope.order.notes = '';
        }

        if(!$rootScope.isTraining) {
          fencesData.postInfo('/orders/' + $scope.order._id, 'PUT', $scope.order).then(function(result) {
            $scope.order_status = result.status;
            $ionicLoading.show({template : 'Order Saved', duration: 500});
            $ionicNavBarDelegate.showBackButton(true);

            if($scope.order.status != 'Appointment Scheduled') {
              $ionicHistory.nextViewOptions({ disableBack: true });
              $state.go('app.orders');
            }
          });
        } else {
          $ionicHistory.nextViewOptions({ disableBack: true });
          $state.go('app.orders');
        }

        // update the dispatch status if it hasn't been started.
        if($rootScope.dispatch && $rootScope.dispatch.status == 'Started') {
          $rootScope.dispatch.status = 'On Time';
          fencesData.postInfo('/dispatches/' + $rootScope.dispatch._id, 'PATCH', $rootScope.dispatch).then(function(result) {
          });
        }
      }
    }
  };
});
