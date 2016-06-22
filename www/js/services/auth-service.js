'use strict';

angular.module('fencesForBusiness.auth_service', [])
	.factory('Auth', ['$http', '$q', '$localStorage', '$ionicHistory', '$state', 'ApiEndpoint',
  function($http, $q, $localStorage, $ionicHistory, $state, ApiEndpoint) { 
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

        var endpoint = ApiEndpoint.baseURL + '/auth/local';

        $http.post(endpoint, {
          email: user.email,
          password: user.password
        }).
        success(function(data) {
        	$localStorage.vendor = data.user.vendor;
        	$localStorage.user = data.user;
          $localStorage.token = data.token;
          deferred.resolve(data);
          return cb();
        }).
        error(function(err) {
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
      }
    };
  }]);
