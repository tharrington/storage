angular.module('fencesForBusiness.damaged_items_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('DamagedItemsCtrl', function($scope, $ionicPopup, OrderInvoiceService, $ionicLoading, $state, fencesData, $stateParams, $ionicModal,  ImageService, $ionicHistory, InvoiceService, $cordovaCamera) {

  $scope.images = [];
  $ionicLoading.show({ template: 'Loading Order...' });

  fencesData.callWrapper('/invoices/getOrderAndInvoice/' + $stateParams.id, 'GET', null)
    .then(function(result) {
      $ionicLoading.hide();
      $scope.images = [];
      $scope.pickup = result.Pickup;
      $scope.delivery = result.Delivery;

      $scope.delivery.damagedImageURLs.forEach(function(entry) {
        $scope.images.push({ src : entry });

        console.log('### got delivery: ' + JSON.stringify($scope.delivery));
        console.log('### got images: ' + JSON.stringify($scope.images));

      });
    }, function(err) {
      $ionicLoading.show({ template: 'There was an error', duration: 1000 });
    });




  $scope.$on( "$ionicView.leave", function( scopes ) {
    $scope.saveOrder();
  });


  $scope.uploadImage = function() {

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
          $scope.delivery.damagedImageURLs.push(response.url);
          $scope.images.push({ src : response.url });
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


  $scope.saveOrder = function() {
    if($scope.delivery.damagedDescription && $scope.delivery.damagedDescription != '' && $scope.images.length > 0) {
      fencesData.postInfo('/orders/' + $scope.delivery._id, 'PUT', $scope.delivery).then(function(result) {
        $ionicLoading.show({template : 'Order Saved', duration: 500});

        $ionicHistory.goBack();
        // $ionicHistory.nextViewOptions({ disableBack: true });
        // $state.go('app.orders');
      });  
    } else if($scope.delivery.damagedDescription && $scope.delivery.damagedDescription != '' && $scope.images.length == 0) {
      var alertPopup = $ionicPopup.alert({
        title: 'Please upload an image'
      });

      alertPopup.then(function(res) {});
    } else if((!$scope.delivery.damagedDescription || $scope.delivery.damagedDescription == '') && $scope.images.length > 0) {
      var alertPopup = $ionicPopup.alert({
        title: 'Please add a description'
      });

      alertPopup.then(function(res) {});
    }
    
  }
});