'use strict';

angular.module('fencesForBusiness.data_service', [])
	.factory('fencesData', ['$http', '$ionicLoading', '$q', 'ApiEndpoint', '$localStorage', '$rootScope', '$timeout', '$cordovaPush', '$state', 'mockFencesData', '$ionicHistory', 'ApiEndpointStaging',
    function($http, $ionicLoading, $q, ApiEndpoint, $localStorage, $rootScope, $timeout, $cordovaPush, $state, mockFencesData, $ionicHistory, ApiEndpointStaging) { 
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

      if(!$rootScope.isTraining) {
      	if(dispatch && dispatch.orders) {
      		dispatch.orders.forEach(function(entry) {
  	    		if(entry._id == id) {
  	    			deferred.resolve(entry);
  	    		}
  	    	});
      	} else {
      		deferred.reject();
      	}
      } else {
        deferred.resolve(mockFencesData.getOrder(id));
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

      if(!$rootScope.isTraining) {
        var config = buildRequestConfig('GET', '/dispatches/getDispatchByDriver/' + myDate);
        $http(config).success(function(data, status, header, config) {
            dispatch = data.dispatch;          
            deferred.resolve(dispatch);
          }).error(function(data, status, header, config) {
            $ionicLoading.hide();
          });
      } else {
        deferred.resolve(mockFencesData.getTodaysDispatch());
      }
      
      return deferred.promise;
    }

    function changeOrderStatus(status, orderId) {
    	var deferred = $q.defer();
      var config = buildRequestConfig('GET', '/dispatches/getDispatchByDriver/driver');
      
      if(!$rootScope.isTraining) {
        $http(config).success(function(data, status, header, config) {
	          deferred.resolve(data);
	        }).error(function(data, status, header, config) {
	        });
      } else {
        deferred.resolve(mockFencesData.changeOrderStatus(status, orderId));
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
      
      if(!$rootScope.isTraining) {
        $http(config).success(function(data, status, header, config) {
          deferred.resolve(data);
        }).error(function(data, status, header, config) {
          
          deferred.reject(data);
        });
      } else {
        mockFencesData.postInfo(endpoint, method, post);
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

      if(!$rootScope.isTraining) {
        $http(config).success(function(data, status, header, config) {
          deferred.resolve(data);
        }).error(function(data, status, header, config) {
          deferred.reject();
        });
      } else {
        deferred.resolve(mockFencesData.callWrapper(endpoint, method, body));
      } 
      return deferred.promise;
    }

    /** 
     * setDispatch
     */
    function setDispatch(dispatch) {
      if(!$rootScope.isTraining) {
        dispatch = dispatch;
      } else {
        mockFencesData.setDispatch(dispatch)
      }
      return;
    }

    /**
     * setOrder
     */
    function setOrder(order) {
      if(!$rootScope.isTraining) {
        order = order;
      } else {
        mockFencesData.setOrder(dispatch)
      }
      return;
    }

    /**
     * getLoadOrder
     */
    function getLoadOrder() {
      if(!$rootScope.isTraining) {
        return order;
      } else {
        return mockFencesData.getLoadOrder();
      }
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
