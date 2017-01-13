
'use strict';

angular.module('fencesForBusiness.invoice_service', [])
	.factory('InvoiceService', ['$q', '$ionicLoading', '$rootScope', function($q, $ionicLoading, $rootScope) {


    var service = {};
    service.invoice = {};
    service.getInvoice = getInvoice;
    service.setInvoice = setInvoice;

    service.products = [];
    service.getProducts = getProducts;
    service.setProducts = setProducts;
    
    service.order = {};
    service.getOrder = getOrder;
    service.setOrder = setOrder;
    

    return service;

    function getInvoice() {
      return service.invoice;
    }

    function setInvoice(invoice) {
      service.invoice = invoice;
    }

    function getProducts() {
      return service.products;
    }

    function setProducts(products) {
      service.products = products;
    }

    function getOrder() {
      return service.order;
    }

    function setOrder(order) {
      service.order = order;
    }
  }]);
