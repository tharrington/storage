angular.module('fencesForBusiness.finalize_invoice_ctrl', ['ngIOS9UIWebViewPatch'])


/**
 * Finalize Invoices - 
 */
.controller('FinalizeInvoiceCtrl', function($scope, $state, $ionicPopup, $ionicLoading, fencesData, ImageService, $ionicHistory, InvoiceService, $cordovaCamera) {
  $scope.invoice = InvoiceService.getInvoice();
  $scope.total_item_count = 0;

  $scope.invoice.items.forEach(function(entry) {
    if(entry.type != 'Service Fees') {
      $scope.total_item_count += entry.quantity;
    }
  });

  $scope.uploadImage = function() {
    var options = {
      quality: 100,
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

    $ionicLoading.show({template : 'Saving Invoice', duration: 1000});
    $scope.invoice.status = 'Ready for Review';
    fencesData.callWrapper('/invoices/' + $scope.invoice._id, 'PUT', $scope.invoice).then(function(result) {
      $ionicLoading.show({template : 'Invoice Saved', duration: 500});
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $state.go('app.orders')
    });
  }
});
