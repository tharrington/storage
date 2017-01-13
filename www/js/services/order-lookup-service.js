
'use strict';

angular.module('fencesForBusiness.order_invoice_service', [])
	.factory('OrderInvoiceService', ['$q', '$ionicLoading', '$rootScope', function($q, $ionicLoading, $rootScope) {


    var service = {};
    service.orderInvoice = {};
    service.getOrderInvoice = getOrderInvoice;
    service.setOrderInvoice = setOrderInvoice;
    

    return service;

    function getOrderInvoice() {
      return service.orderInvoice;
    }

    function setOrderInvoice(orderInvoice) {
      service.orderInvoice = orderInvoice;
    }
  }]);
