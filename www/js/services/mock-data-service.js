'use strict';

angular.module('fencesForBusiness.mock_data_service', [])
	.factory('mockFencesData', ['$http', '$ionicLoading', '$q', 'ApiEndpoint', '$localStorage', '$rootScope', '$timeout', '$cordovaPush', '$state', '$ionicHistory', 'ApiEndpointStaging',
    function($http, $ionicLoading, $q, ApiEndpoint, $localStorage, $rootScope, $timeout, $cordovaPush, $state, $ionicHistory, ApiEndpointStaging) { 
    var dispatch = {}, order = {};

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
    	var deferred = $q.defer();

      var data = $localStorage.tutorial_data;
      
      // this endpoint is harder
      if(endpoint.indexOf('/invoices/bySSOrderId/') != -1) {
        var order = {}, invoice = {};
        var recordId = endpoint.substring(22, endpoint.length); console.log('### recordId: ' + recordId);

        // Find the order and invoice
        data.orders.forEach(function(entry) {
          if(recordId == entry.ssOrderId) {
            order = entry;
          }
        });
        data.invoices.forEach(function(entry) {
          if(recordId == entry.order_id) {
            invoice = entry;
          }
        });

        var retObj = {
          products : data.products,
          order : order,
          invoice : invoice
        }
        deferred.resolve(retObj);
      } else {
        if(method == 'GET') {
          var return_val = data[method][endpoint];

          // should we return an array or a specific record?
          if(return_val instanceof Array && data[method][endpoint].return_type == 'record') {
            var record_id = endpoint[endpoint.length - 1];
            return_val.forEach(function(entry) {
              if(entry._id == record_id) {
                deferred.resolve(entry);
              }
            });
          } else {
            deferred.resolve(return_val);
          }
        } else {
          // var return_val = data[method][endpoint];
          console.log('### return');
          deferred.resolve();
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

    // validate 
    function validateInvoiceItem(valid_item, item, order) {
      if(valid_item.quantity != item.quantity) {
        return { is_valid : false, message: order.name + '\'s order should have ' + valid_item.quantity + ' for ' + valid_item.product_name + '.' };
      }

      return { is_valid : true, message: '' };
    }

    /**
     * validate individual invoice
     */
    function findOrderFromInvoice(orders, invoice) {
      for(var i = 0; i < orders.length; i++) {
        if(orders[i].ssOrderId == invoice.order_id) {
          return orders[i];
        }
      }
    }

    /**
     * validate individual invoice
     */
    function validateInvoice(invoice) {
      var validated_invoices = $localStorage.tutorial_data.invoices_validated;
      var orders = $localStorage.tutorial_data.orders;
      var order = findOrderFromInvoice(orders, invoice);

      invoice.items.forEach(function(item) {
        item.validated = false;
      });

      for(var x = 0; x < validated_invoices.length; x++) {
        var valid_invoice = validated_invoices[x];

        if(valid_invoice._id == invoice._id) {

          if(invoice.status != valid_invoice.status) {
            return { 
              is_valid : false, 
              message: order.name + '\'s invoice does not have the correct status: ' + valid_invoice.status
            };
          }

          // validate that all items exist
          for(var i = 0; i < valid_invoice.items.length; i++) {
            var validated_item = false;
            var invoice_products = '';
            for(var j = 0; j < invoice.items.length; j++) {
              if(invoice.items[j].product_name == valid_invoice.items[i].product_name) {
                if(!validateInvoiceItem(valid_invoice.items[i], invoice.items[j], order).is_valid) {
                  return validateInvoiceItem(valid_invoice.items[i], invoice.items[j], order);
                }
                validated_item = true;
                invoice.items[j].validated = true;
              } 
            }
            
            if(!validated_item) {
              return { 
                is_valid : false, 
                message: order.name + '\'s order should have ' + valid_invoice.items[i].quantity + ' ' + valid_invoice.items[i].product_name + 's.'
              };
            }
          }
        }
      }

      for(var x = 0; x < invoice.items.length; x++) {
        var item = invoice.items[x];
        if(!item.validated) {
          return { 
            is_valid : false, 
            message: 'You added ' + item.quantity + ' ' + item.product_name + 's to ' + order.name + '\'s invoice but that isn\'t right!'
          };
        }
      }

      return { is_valid : true, message: '' };
    }

    /**
     * validate the entire tutorial
     */
    function validateTutorial() {
      var invoices = $localStorage.tutorial_data.invoices;
      for(var x = 0; x < invoices.length; x++) {
        var validate_result = validateInvoice(invoices[x]);
        if(!validate_result.is_valid) {
          return validate_result;
        }
      }

      return { is_valid : true, message: '' };
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
      init                      : init,
      validateInvoice           : validateInvoice,
      validateTutorial          : validateTutorial,
      findOrderFromInvoice      : findOrderFromInvoice
    };
	}]);
