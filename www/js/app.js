// Fences For Business Mobile App
angular.module('fencesForBusiness', [
  'ionic', 
  'ngIOS9UIWebViewPatch',
  'fencesForBusiness.app_ctrl',
  'fencesForBusiness.today_ctrl',
  'fencesForBusiness.login_ctrl', 
  'fencesForBusiness.order_ctrl', 
  'fencesForBusiness.data_service',
  'fencesForBusiness.mock_data_service',
  'fencesForBusiness.image_service',
  'fencesForBusiness.location_service',
  'fencesForBusiness.auth_service',
  'fencesForBusiness.invoice_service',
  'fencesForBusiness.order_invoice_service',
  'fencesForBusiness.order_summary_ctrl',
  'fencesForBusiness.past_dispatches_ctrl',
  'fencesForBusiness.past_dispatch_ctrl',
  'fencesForBusiness.warehouse_ctrl',
  'fencesForBusiness.load_dispatch_ctrl',
  'fencesForBusiness.load_order_ctrl',
  'fencesForBusiness.invoice_ctrl',
  'fencesForBusiness.lookup_ctrl',
  'fencesForBusiness.finalize_invoice_ctrl',
  'ngStorage', 
  'ngCordova',
  'angularMoment'
])

.constant('ApiEndpoint', { url: 'https://onelight-fences.herokuapp.com/api', baseURL : 'https://onelight-fences.herokuapp.com' })
// .constant('ApiEndpointStaging', { url: 'http://localhost:5000/api', baseURL : 'http://localhost:5000' })
.constant('ApiEndpointStaging', { url: 'https://fences-staging.herokuapp.com/api', baseURL : 'https://fences-staging.herokuapp.com' })
  

.run(function($ionicPlatform, $localStorage, $ionicHistory, $state, $http, fencesLocations, $rootScope) {
	$rootScope.version = '4.0.0';

  $ionicPlatform.ready(function() {
    fencesLocations.startLocation();
    if(hockeyapp) {
      hockeyapp.start(null, null, "ff5782db811a44a79fb5eb47a37cec95");
      hockeyapp.checkForUpdate(function() {}, function(err) {});
    }    
  });
})

.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');

  $stateProvider
    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'AppCtrl'
    })
    .state('app.login', {
      url: '/login',
      controller: 'LoginCtrl',
      views: {
        'menuContent': {
          templateUrl: 'templates/login.html'
        }
      }
    })
    .state('app.warehouse', {
      url: '/warehouse',
      controller: 'WarehouseCtrl',
      views: {
        'menuContent': {
          templateUrl: 'templates/warehouse.html'
        }
      }
    })
    .state('app.order_summary', {
      url: '/order_summary/:id',
      views: {
        'menuContent': {
          templateUrl: 'templates/order_summary.html'
        }
      }
    })
    .state('app.lookup', {
      url: '/lookup',
      controller: 'LookupCtrl',
      views: {
        'menuContent': {
          templateUrl: 'templates/lookup.html'
        }
      }
    })
    .state('app.load_dispatch', {
      url: '/load_dispatch/:id',
      views: {
        'menuContent': {
          templateUrl: 'templates/load_dispatch.html'
        }
      }
    })
    .state('app.invoice', {
      url: '/invoice/:id',
      views: {
        'menuContent': {
          templateUrl: 'templates/invoice.html'
        }
      }
    })
    .state('app.finalize_invoice', {
      url: '/finalize_invoice/:id',
      views: {
        'menuContent': {
          templateUrl: 'templates/finalize_invoice.html'
        }
      }
    })
    .state('app.load_order', {
      url: '/load_order/:id',
      views: {
        'menuContent': {
          templateUrl: 'templates/load_order.html'
        }
      }
    })
    .state('app.orders', {
      url: '/orders',
      views: {
        'menuContent': {
          templateUrl: 'templates/today.html'
        }
      }
    })
    .state('app.past', {
      url: '/past',
      views: {
        'menuContent': {
          templateUrl: 'templates/past_dispatches.html'
        }
      }
    })
    .state('app.past_dispatch', {
      url: '/past_dispatch/:id',
      views: {
        'menuContent': {
          templateUrl: 'templates/past_dispatch.html'
        }
      }
    })

    .state('app.order', {
      url: '/orders/:id',
      views: {
        'menuContent': {
          templateUrl: 'templates/order.html'
        }
      }
    });
    $urlRouterProvider.otherwise('/app/orders');
})


.factory('authInterceptor', function ($rootScope, $q, $injector, $localStorage, $location, $log) {
  return {
    // Add authorization token to headers
    request: function (config) {
      config.headers = config.headers || {};

      if ($localStorage.token) {
        config.headers['x-access-token'] = $localStorage.token;
      } 
      return config;
    },

    // Intercept 401s and redirect you to login
    responseError: function(response) {
      if(response.status === 401) {
        $localStorage.$reset();
        $injector.get('$state').transitionTo('app.login');
        return $q.reject(response);
      }
      else {
        return $q.reject(response);
      }
    }
  };
})

.run(function ($rootScope, $state, Auth) {
  // Redirect to login if route requires auth and you're not logged in
  $rootScope.$on('$stateChangeStart', function (event, next) {
  });
});
