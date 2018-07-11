angular.module('fencesForBusiness.finalize_delivery_ctrl', ['ngIOS9UIWebViewPatch'])


/**
 * Finalize Delivery - 
 */
.controller('FinalizeDeliveryCtrl', function($scope, $stateParams, $ionicNavBarDelegate, mockFencesData, $localStorage, $rootScope, $state, $ionicPopup, $ionicLoading, fencesData, ImageService, $ionicHistory, InvoiceService, $cordovaCamera) {
  $scope.order = InvoiceService.getOrder();
  $scope.total_item_count = 0;
  $scope.total_added_services_count = 0;

  $scope.items = [];
  $scope.added_services = [];

  /**
  crewDeliveryNote  : String,
  deliveryImage     : [String],

  */

  fencesData.callWrapper('/invoices/getOrderAndInvoice/' + $stateParams.id, 'GET', null)
    .then(function(result) {
      $scope.order = result.Delivery;

      console.log('### got finalized order: ' + JSON.stringify($scope.order));
    });




  $scope.uploadImage = function() {
    console.log('### upload image...');
    var options = {
      quality: 50,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: false,
      targetWidth: 400,
      targetHeight: 400,
      encodingType: Camera.EncodingType.JPEG,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false
    };

    // Take photos and upload the image urls to Cloudinary. 
    // The image urls are then saved on the invoice record.
    $cordovaCamera.getPicture(options).then(function(imageData) {
      ImageService.uploadImage(imageData).then(function(response) {
        $scope.order.deliveryImage.push(response.url);
      });
    }, function(err) {
        // error
        var alertPopup = $ionicPopup.alert({
           title: 'There was an error opening the camera: ' + err,
           template: JSON.stringify(err)
        });

        alertPopup.then(function(res) {});
        console.log(err);
    });
  }

  $scope.saveDelivery = function() {
    if($scope.order.deliveryImage.length == 0) {
      var alertPopup = $ionicPopup.alert({
         title: 'Take a photo to complete delivery!',
         template: 'Take a photo to complete delivery!'
      });

      alertPopup.then(function(res) {});
      return;
    }

    $scope.$on('$ionicView.enter', function(e) {
      $ionicNavBarDelegate.showBackButton(true);
    });

    
    $ionicLoading.show({ template : 'Complete Delivery' });
    $scope.order.status = 'Complete';


    fencesData.callWrapper('/orders/' + $scope.order._id, 'PUT', $scope.order).then(function(result) {
      $ionicHistory.nextViewOptions({ disableBack: true });
          $state.go('app.orders');
      $ionicLoading.hide();
    });
  }
});
