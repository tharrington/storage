
'use strict';

angular.module('fencesForBusiness.order_invoice_service', [])
	.factory('OrderInvoiceService', ['$q', '$ionicLoading', '$rootScope', function($q, $ionicLoading, $rootScope) {


    var service = {};
    service.ssOrderId;
    service.orderInvoice = {};
    service.getOrderInvoice = getOrderInvoice;
    service.setOrderInvoice = setOrderInvoice;
    service.getSSOrderId = getSSOrderId;
    service.setSSOrderId = setSSOrderId;

    return service;

    function getOrderInvoice() {
      return service.orderInvoice;
    }

    function setOrderInvoice(orderInvoice) {
      service.orderInvoice = orderInvoice;
    }

    function getSSOrderId() {
      return service.orderInvoice;
    }

    function setSSOrderId(ssOrderId) {
      service.ssOrderId = ssOrderId;
    }
  }]);
