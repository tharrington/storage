'use strict';

angular.module('fencesForBusiness.mock_data_service', [])
	.factory('mockFencesData', ['$http', '$ionicLoading', '$q', 'ApiEndpoint', '$localStorage', '$rootScope', '$timeout', '$cordovaPush', '$state', '$ionicHistory', 'ApiEndpointStaging',
    function($http, $ionicLoading, $q, ApiEndpoint, $localStorage, $rootScope, $timeout, $cordovaPush, $state, $ionicHistory, ApiEndpointStaging) { 
    var dispatch = {}, order = {};

    console.log('### mock fences service');

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

      dispatch = $localStorage.tutorial_data.dispatch;
      dispatch.orders = $localStorage.tutorial_data.orders;
      deferred.resolve(dispatch);
      return deferred.promise;
    }

    function changeOrderStatus(status, orderId) {
    	var deferred = $q.defer();

      return deferred.promise;
    };

    /** 
     * postInfo                   - The wrapper for all things create
     * @return                    - The result from the backend
     */
    function postInfo(endpoint, method, post) {
      this.callWrapper(endpoint, method, post)
    };


    function callWrapper(endpoint, method, body) {
      console.log('### callWrapper tutorial endpoint: ' + endpoint);
      console.log('### callWrapper tutorial method: ' + method);
    	var deferred = $q.defer();

      var data = $localStorage.tutorial_data;
      
      // this endpoint is harder
      if(endpoint.indexOf('/invoices/bySSOrderId/') != -1) {
        // $scope.products = result.products;
        // $scope.order = result.order;
        // $scope.invoice = result.invoice;
        var order = {}, invoice = {};
        data.orders.forEach(function(entry) {

        });
        data.invoices.forEach(function(entry) {

        });
        var retObj = {
          products : data.products,
          order : order,
          invoice : invoice
        }
      } else {
        if(method == 'GET') {
          var return_val = data[method][endpoint];

          // should we return an array or a specific record?
          if(return_val instanceof Array && data[method][endpoint].return_type == 'record') {
            var record_id = endpoint[endpoint.length - 1];
            console.log('### record id: ' + record_id);
            return_val.forEach(function(entry) {
              if(entry._id == record_id) {
                deferred.resolve(entry);
              }
            });
          } else {
            deferred.resolve(return_val);
          }

          
        } else {
          var return_val = data[method][endpoint];
          // if(return_val instanceof Array) {
          //   var record_id = endpoint[endpoint.length - 1];
          //   console.log('### record id: ' + record_id);
          //   return_val.forEach(function(entry) {
          //     if(entry._id == record_id) {
          //       entry = body;
          //     }
          //   });
          // }

          deferred.resolve(return_val);
        }
      }
      
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
     * Init the mock database
     */
    function init() {
      var deferred = $q.defer();
      $http.get('seed.json')
        .success(function(data) {
          data.dispatch.dispatchDate = new Date();
          data.orders.forEach(function(entry) {
            entry.deliveryDate = new Date();
          });
          $localStorage.tutorial_data = data;
          deferred.resolve();
        })
        .error(function() {
          deferred.reject('could not find seed.json');
        });
      return deferred.promise;
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
      getLoadOrder              : getLoadOrder,
      init                      : init
    };
	}]);
