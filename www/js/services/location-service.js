'use strict';

angular.module('fencesForBusiness.location_service', [])
	.factory('fencesLocations', ['$http', '$ionicPopup', '$localStorage', '$rootScope', '$ionicHistory', '$state', 
    'fencesData', '$ionicPlatform',
  function($http, $ionicPopup, $localStorage, $rootScope, $ionicHistory, $state, fencesData, $ionicPlatform) { 
    var bgGeo, pushLocation, failureFn;

    failureFn = function(error) {
      $rootScope.locationServicesDisabled = true;
      $ionicHistory.nextViewOptions({ disableBack: true });
    }

    pushLocation = function(position, taskId) {
      $rootScope.locationServicesDisabled = false;
      $rootScope.position = position;

      
      if(!$rootScope.isTraining) {
        if ($localStorage.token || $localStorage.mover_token) {
          fencesData.postInfo('/users/updateLocation', 'POST', position).then(function(result) {
            bgGeo.finish(taskId);
          });
        }
      }
    }

    function sendUpdate() {
      bgGeo.getCurrentPosition(pushLocation, failureFn);
    }

    function startLocation() {
      bgGeo = window.BackgroundGeolocation;      
      if(bgGeo) {
        var locationConfig = {
          desiredAccuracy: 10,
          stationaryRadius: 25,
          distanceFilter: 10,
          disableElasticity: false, 
          locationUpdateInterval: 10000,
          minimumActivityRecognitionConfidence: 10, 
          fastestLocationUpdateInterval: 10000,
          activityType: BackgroundGeolocation.ACTIVITY_TYPE_AUTOMOTIVE_NAVIGATION,
          debug: false, 
          stopOnTerminate: false 
        }
        bgGeo.configure(pushLocation, failureFn, locationConfig);
        bgGeo.start(function() {
        	bgGeo.changePace(true);
        });
      } 
    }


    /**
     * Public API
     */
    return {
    	startLocation				      : startLocation,
      sendUpdate                : sendUpdate
    };
	}]);

