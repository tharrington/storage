'use strict';

angular.module('fencesForBusiness.data_service', [])
	.factory('fencesData', ['$http', '$ionicLoading', '$q', 'ApiEndpoint', '$localStorage', '$rootScope', '$timeout', '$cordovaPush', '$state', '$ionicHistory', 'ApiEndpointStaging',
    function($http, $ionicLoading, $q, ApiEndpoint, $localStorage, $rootScope, $timeout, $cordovaPush, $state, $ionicHistory, ApiEndpointStaging) { 
    var dispatch = {}, order = {};

    function buildRequestConfig(method, endpoint, body) {
      var config;

      if(!$localStorage.isStaging) {
        config = { url: ApiEndpoint.url + endpoint, timeout: 6000, method: method };
      } else {
        config = { url: ApiEndpointStaging.url + endpoint, timeout: 6000, method: method };
      }

      if(method === 'POST' || method === 'PUT' || method === 'PATCH') {
        config.data = body;
      }
      return config;
    }

    /**
     * getOrder 				  - get orders
     * @return            - {order:}
     */
    function getOrder(id) {
    	var deferred = $q.defer();
    	if(dispatch && dispatch.orders) {
    		dispatch.orders.forEach(function(entry) {
	    		if(entry._id == id) {
	    			deferred.resolve(entry);
	    		}
	    	});
    	} else {
    		deferred.reject();
    	}
    	return deferred.promise;
    }

    /**
     * getTodaysDispatch  - Builds the object needed by the main app controller. This will contain
     *                      my current tasks, pending invitations and general profile information.
     * @return            - {tasks:}
     */
    function getTodaysDispatch() {
      var deferred = $q.defer();

      var myMoment = moment();
      myMoment.hours(0).minutes(0).seconds(0);
      var myDate = new Date(myMoment);

      if(!$rootScope.isTutorial) {
        var config = buildRequestConfig('GET', '/dispatches/getDispatchByDriver/' + myDate);
        $http(config).success(function(data, status, header, config) {
            dispatch = data.dispatch;          
            deferred.resolve(dispatch);
          }).error(function(data, status, header, config) {
            $ionicLoading.hide();
          });
      } else {
        console.log('### do tutorial');
      }
      
      return deferred.promise;
    }

    function changeOrderStatus(status, orderId) {
    	var deferred = $q.defer();
      var config = buildRequestConfig('GET', '/dispatches/getDispatchByDriver/driver');
      
      if(!$rootScope.isTutorial) {
        if(navigator.connection.type != Connection.NONE) {
          $http(config).success(function(data, status, header, config) {
  	          deferred.resolve(data);
  	        }).error(function(data, status, header, config) {
  	        });
        } else {
          $rootScope.notConnected = true;
          deferred.resolve();
        }
      } else {
        console.log('### DO TUTORIAL')
      }
      return deferred.promise;
    };

    /** 
     * postInfo                   - The wrapper for all things create
     * @return                    - The result from the backend
     */
    function postInfo(endpoint, method, post) {
      var deferred = $q.defer();
      var config = buildRequestConfig(method, endpoint, post);
      
      if(!$rootScope.isTutorial) {
        $http(config).success(function(data, status, header, config) {
          $rootScope.notConnected = false;
          $rootScope.errorCount = 0;
          deferred.resolve(data);
        }).error(function(data, status, header, config) {
          if(!$rootScope.errorCount) $rootScope.errorCount = 0;
          $rootScope.errorCount = $rootScope.errorCount + 1;
          if($rootScope.errorCount == 5) {
            $rootScope.notConnected = true;
          } 
          deferred.resolve();
        });
      } else {
        console.log('### do tutorial post');
      }
      return deferred.promise;
    
    };


    function callWrapper(endpoint, method, body) {
    	var deferred = $q.defer();
    	var myMethod = 'GET';
    	if(method) {
    		myMethod = method;
    	}
      var config = buildRequestConfig(myMethod, endpoint, body);
      var deferred = $q.defer();

      if(!$rootScope.isTutorial) {
        $http(config).success(function(data, status, header, config) {
          deferred.resolve(data);
        }).error(function(data, status, header, config) {
          deferred.reject();
        });
      } else {
        console.log('### call wrapper tutorial');
      }
      return deferred.promise;
    }

    /** 
     * setDispatch
     */
    function setDispatch(dispatch) {
      dispatch = dispatch;
      return;
    }

    /**
     * setOrder
     */
    function setOrder(order) {
      order = order;
      return;
    }

    /**
     * getLoadOrder
     */
    function getLoadOrder() {
      return order;
    }



    /**
     * Public API
     */
    return {
    	getTodaysDispatch			    : getTodaysDispatch,
      postInfo                  : postInfo,
      getOrder									: getOrder,
      changeOrderStatus					: changeOrderStatus,
      callWrapper								: callWrapper,
      setDispatch               : setDispatch,
      setOrder                  : setOrder,
      getLoadOrder              : getLoadOrder    
    };
	}]);
