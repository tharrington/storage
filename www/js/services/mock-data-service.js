'use strict';

angular.module('fencesForBusiness.mock_data_service', [])
	.factory('mockFencesData', ['$http', '$ionicLoading', '$q', 'ApiEndpoint', '$localStorage', '$rootScope', '$timeout', '$cordovaPush', '$state', '$ionicHistory', 'ApiEndpointStaging',
    function($http, $ionicLoading, $q, ApiEndpoint, $localStorage, $rootScope, $timeout, $cordovaPush, $state, $ionicHistory, ApiEndpointStaging) { 
    var dispatch = {}, order = {};

    function buildRequestConfig(method, endpoint, body) {
      var config;
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
      return deferred.promise;
    }

    function changeOrderStatus(status, orderId) {
    	var deferred = $q.defer();
      var config = buildRequestConfig('GET', '/dispatches/getDispatchByDriver/driver');
      return deferred.promise;
    };

    /** 
     * postInfo                   - The wrapper for all things create
     * @return                    - The result from the backend
     */
    function postInfo(endpoint, method, post) {
      var deferred = $q.defer();
      var config = buildRequestConfig(method, endpoint, post);
      return deferred.promise;
    };


    function callWrapper(endpoint, method, body) {
    	var deferred = $q.defer();
      return deferred.promise;
    }

    function setDispatch(dispatch) {
      dispatch = dispatch;
      return;
    }

    function setOrder(order) {
      order = order;
      return;
    }

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
