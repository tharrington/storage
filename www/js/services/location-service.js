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
          desiredAccuracy: 100,
          stationaryRadius: 50,
          distanceFilter: 50,
          disableElasticity: false, 
          locationUpdateInterval: 5000,
          minimumActivityRecognitionConfidence: 70, 
          fastestLocationUpdateInterval: 4000,
          activityType: 'Other',
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

