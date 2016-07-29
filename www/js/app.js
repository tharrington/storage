// Fences For Business Mobile App
angular.module('fencesForBusiness', [
  'ionic', 
  'ngIOS9UIWebViewPatch',
  'fencesForBusiness.app_ctrl',
  'fencesForBusiness.today_ctrl',
  'fencesForBusiness.login_ctrl', 
  'fencesForBusiness.order_ctrl', 
  'fencesForBusiness.data_service',
  'fencesForBusiness.location_service',
  'fencesForBusiness.auth_service',
  'fencesForBusiness.past_dispatches_ctrl',
  'fencesForBusiness.past_dispatch_ctrl',
  'fencesForBusiness.warehouse_ctrl',
  'fencesForBusiness.load_dispatch_ctrl',
  'fencesForBusiness.load_order_ctrl',
  'ngStorage', 
  'ngCordova',
  'angularMoment'
])

// .constant('ApiEndpoint', { url: 'https://onelight-fences.herokuapp.com/api', baseURL : 'https://onelight-fences.herokuapp.com' })
.constant('ApiEndpoint', { url: 'http://localhost:5000/api', baseURL : 'http://localhost:5000' })
//.constant('ApiEndpoint', { url: 'https://fences-staging.herokuapp.com/api', baseURL : 'https://fences-staging.herokuapp.com' })
  

.run(function($ionicPlatform, $localStorage, $ionicHistory, $state, $http, fencesLocations, $rootScope) {
	$rootScope.version = '1.1.0 production';

  $ionicPlatform.ready(function() {
    fencesLocations.startLocation();
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
    .state('app.load_dispatch', {
      url: '/load_dispatch/:id',
      views: {
        'menuContent': {
          templateUrl: 'templates/load_dispatch.html'
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
