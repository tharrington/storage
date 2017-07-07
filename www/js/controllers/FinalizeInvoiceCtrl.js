angular.module('fencesForBusiness.finalize_invoice_ctrl', ['ngIOS9UIWebViewPatch'])


/**
 * Finalize Invoices - 
 */
.controller('FinalizeInvoiceCtrl', function($scope, $ionicNavBarDelegate, mockFencesData, $localStorage, $rootScope, $state, $ionicPopup, $ionicLoading, fencesData, ImageService, $ionicHistory, InvoiceService, $cordovaCamera) {
  $scope.invoice = InvoiceService.getInvoice();
  $scope.order = InvoiceService.getOrder();
  $scope.total_item_count = 0;
  $scope.total_added_services_count = 0;

  $scope.items = [];
  $scope.added_services = [];

  if($scope.invoice && $scope.invoice.items) {
    $scope.invoice.items.forEach(function(entry) {
      if(entry.type != 'Service Fees') {
        if(entry.product_name.indexOf('Mattress Bag') != 0 &&
          entry.product_name.indexOf('Overweight Box') != 0 &&
          entry.product_name.indexOf('Room Service') != 0 &&
          entry.product_name.indexOf('Moving Blanket') != 0 &&
          entry.product_name.indexOf('Declared Value') != 0) {
          $scope.total_item_count += entry.quantity;
          $scope.items.push(entry);
        } else {
          $scope.added_services.push(entry);
          $scope.total_added_services_count += entry.quantity;
        }
      }
    });
  } else {
    $state.go('app.orders');
  }

  

  $scope.uploadImage = function() {
    var options = {
      quality: 50,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: false,
      encodingType: Camera.EncodingType.JPEG,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false
    };

    // Take photos and upload the image urls to Cloudinary. 
    // The image urls are then saved on the invoice record.
    $cordovaCamera.getPicture(options).then(function(imageData) {
    		ImageService.uploadImage(imageData).then(function(response) {
          $scope.invoice.imageURLs.push(response.url);
    		});
    }, function(err) {
        // error
        console.log(err);
    });
  }

  $scope.saveInvoice = function() {
  	if($scope.invoice.imageURLs.length == 0 && $scope.total_item_count != 0) {
      var alertPopup = $ionicPopup.alert({
         title: 'Take some photos!',
         template: 'Take some photos, dude!'
      });

      alertPopup.then(function(res) {});
      return;
    }

    $scope.$on('$ionicView.enter', function(e) {
      $ionicNavBarDelegate.showBackButton(true);
    });

    
    $ionicLoading.show({ template : 'Saving Invoice' });
    $scope.invoice.status = 'Ready for Review';

    fencesData.callWrapper('/invoices/' + $scope.invoice._id, 'PUT', $scope.invoice).then(function(result) {
      
      if($rootScope.isTraining) {
        var validate_result = mockFencesData.validateInvoice($scope.invoice);
        if(validate_result.is_valid) {
          var orders = $localStorage.tutorial_data.orders;
          var order = mockFencesData.findOrderFromInvoice(orders, $scope.invoice);
          order.status = 'Complete';
          $ionicLoading.show({template : 'Invoice Saved', duration: 500});
          $ionicHistory.nextViewOptions({ disableBack: true });
          $state.go('app.orders');
        } else {
          $ionicLoading.show({template : validate_result.message, duration: 3000});
        }
      } else {
        $ionicLoading.show({template : 'Invoice Saved', duration: 500});
        $ionicHistory.nextViewOptions({ disableBack: true });
        $state.go('app.orders');
      }
      
    });
  }
});
