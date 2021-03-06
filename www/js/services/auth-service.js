'use strict';

angular.module('fencesForBusiness.auth_service', [])
	.factory('Auth', ['$http', '$log', '$rootScope', '$q', '$localStorage', '$ionicHistory', '$state', 'ApiEndpoint', 'ApiEndpointStaging',
  function($http, $log, $rootScope, $q, $localStorage, $ionicHistory, $state, ApiEndpoint, ApiEndpointStaging) { 
    var currentUser = {};
    if($localStorage.token) {
      currentUser = $localStorage.user;
    }
    
    return {

      /**
       * Authenticate user and save token
       *
       * @param  {Object}   user     - login info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      login: function(user, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();

        var endpoint;
        if($localStorage.isStaging) {
          endpoint = ApiEndpointStaging.baseURL + '/auth/local';
        } else {
          endpoint = ApiEndpoint.baseURL + '/auth/local';
        }

        if($rootScope.isTraining) {
          var data = {};

          $localStorage.user = data.user;
          $localStorage.token = data.token;
          
          deferred.resolve(data);
        }

        $http.post(endpoint, {
          email: user.email,
          password: user.password
        }).
        success(function(data) {

          if(data.user.role == 'Mover' || data.user.role == 'Business') {
            $localStorage.mover = data.user;
            $localStorage.mover_token = data.token;
          } else {
            $localStorage.user = data.user;
            $localStorage.token = data.token;
          }
          deferred.resolve(data);
          return cb();
        }).
        error(function(err) {
          console.log("### err: " + JSON.stringify(err));
          this.logout();
          deferred.reject(err);
          return cb(err);
        }.bind(this));

        return deferred.promise;
      },

      /**
       * Delete access token and user info
       *
       * @param  {Function}
       */
      logout: function() {
        $localStorage.$reset();
        $ionicHistory.nextViewOptions({ disableBack: true });
        $state.go('app.login');
      },

      /**
       * Gets all available info on authenticated user
       *
       * @return {Object} user
       */
      getCurrentUser: function() {
        return currentUser;
      },

      /**
       * Check if a user is logged in
       *
       * @return {Boolean}
       */
      isLoggedIn: function() {
        return currentUser.hasOwnProperty('_id');
      },

      /**
       * Get auth token
       */
      getToken: function() {
        return $localStorage.token;
      },

      /**
       * Check the last truck login, the user needs to have selected a truck within the last 24 
       * hours or they should be returned to the main screen.
       */ 
      checkLastTruckLogin : function() {
        if($rootScope.trainingInProgress) {
          return;
        }
        
        // check the user has logged in before
        if($localStorage.token || $localStorage.mover_token) {
          if($localStorage.lastTruckLogin && $localStorage.mover && $localStorage.mover.tutorialCompleted && $localStorage.user) {
            // check when the last time they selected a driver was
            if(!moment($localStorage.lastTruckLogin).isSame(moment(), 'day')) {
              $ionicHistory.nextViewOptions({ disableBack: true });
              $state.go('app.drivers');
            } 
          } else {
            $ionicHistory.nextViewOptions({ disableBack: true });
            $state.go('app.drivers');
          } 
        }
      }
    };
  }]);
