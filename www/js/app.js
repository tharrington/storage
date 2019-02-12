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
  'fencesForBusiness.supplies_ctrl',
  'fencesForBusiness.missing_items_ctrl',
  'fencesForBusiness.warehouse_ctrl',
  'fencesForBusiness.load_dispatch_ctrl',
  'fencesForBusiness.load_order_ctrl',
  'fencesForBusiness.invoice_ctrl',
  'fencesForBusiness.finalize_delivery_ctrl',
  'fencesForBusiness.lost_items_ctrl',
  'fencesForBusiness.damaged_items_ctrl',
  'fencesForBusiness.lookup_ctrl',
  'fencesForBusiness.drivers_ctrl',
  'fencesForBusiness.warehouse_load_ctrl',
  'fencesForBusiness.finalize_invoice_ctrl',
  'fencesForBusiness.create_shipping_labels_ctrl',
  'fencesForBusiness.existing_shipping_labels_ctrl',
  'fencesForBusiness.time_cards_ctrl',
  'fencesForBusiness.shipping_today_ctrl',
  'ngStorage',
  'ion-gallery',
  'ngCordova',
  'angularMoment'
])

//ionic cordova build ios -- --buildFlag="-UseModernBuildSystem=0"



// Dev
// .constant('ApiEndpoint', { url: 'http://localhost:5000/api', baseURL : 'http://localhost:5000' })
// .constant('ApiEndpointStaging', { url: 'http://localhost:5000/api', baseURL : 'http://localhost:5000' })

// Staging
// .constant('ApiEndpoint', { url: 'https://fences-staging.herokuapp.com/api', baseURL : 'https://fences-staging.herokuapp.com' })
// .constant('ApiEndpointStaging', { url: 'https://fences-staging.herokuapp.com/api', baseURL : 'https://fences-staging.herokuapp.com' })

// Production
.constant('ApiEndpoint', { url: 'https://storage-squad-scheduling.herokuapp.com/api', baseURL : 'https://storage-squad-scheduling.herokuapp.com' })
.constant('ApiEndpointStaging', { url: 'https://fences-staging.herokuapp.com/api', baseURL : 'https://fences-staging.herokuapp.com' })


.run(function($ionicPlatform, $localStorage, $ionicHistory, $state, $http, fencesLocations, $rootScope) {
	$rootScope.version = '8.0.3';

  if($localStorage.mover && !$localStorage.mover.tutorialCompleted) {
    $rootScope.isTraining = true;
  }

  $ionicPlatform.ready(function() {
    fencesLocations.startLocation();

    if(hockeyapp) {
      if(device.platform != 'Android') {
        hockeyapp.start(null, null, "ff5782db811a44a79fb5eb47a37cec95");
        hockeyapp.checkForUpdate(function() {}, function(err) {});
      } else {
        hockeyapp.start(null, null, "7a6c56a424724895bcb2da0564d04935");
        hockeyapp.checkForUpdate(function() {}, function(err) {});
      }
      if (window.cordova && window.cordova.plugins.Keyboard){
          cordova.plugins.Keyboard.disableScroll(true); // This will prevent the view to bounce when inputs are on focus
      }
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
  $httpProvider.interceptors.push('timeoutHttpIntercept');

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
    .state('app.supplies', {
      url: '/supplies',
      controller: 'SuppliesCtrl',
      views: {
        'menuContent': {
          templateUrl: 'templates/supplies.html'
        }
      }
    })
    .state('app.supplies-lookup', {
      url: '/supplies-lookup',
      controller: 'LookupCtrl',
      views: {
        'menuContent': {
          templateUrl: 'templates/lookup.html'
        }
      }
    })
    .state('app.missing-items', {
      url: '/missing-items/:id',
      controller: 'MissingItemsCtrl',
      views: {
        'menuContent': {
          templateUrl: 'templates/missing_items.html'
        }
      }
    })
    .state('app.order_summary', {
      url: '/order_summary/:id/:fromWarehouse',
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

    .state('app.lost_items', {
      url: '/lost_items/:id',
      views: {
        'menuContent': {
          templateUrl: 'templates/lost_items_dispatch.html'
        }
      }
    })

    .state('app.damaged_items', {
      url: '/damaged_items/:id',
      views: {
        'menuContent': {
          templateUrl: 'templates/damaged_items.html'
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
    .state('app.finalize_delivery', {
      url: '/finalize_delivery/:id',
      views: {
        'menuContent': {
          templateUrl: 'templates/finalize_delivery.html'
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

    .state('app.load_truck', {
      url: '/load_truck',
      views: {
        'menuContent': {
          templateUrl: 'templates/warehouse_load.html'
        }
      }
    })

    .state('app.drivers', {
      url: '/drivers',
      views: {
        'menuContent': {
          templateUrl: 'templates/drivers.html'
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
    })

    .state('app.shipping-today', {
      url: '/shipping',
      views: {
        'menuContent': {
          templateUrl: 'templates/shipping.html'
        }
      }
    })


    .state('app.create_shipping_labels', {
      url: '/create_shipping_labels/:id',
      views: {
        'menuContent': {
          templateUrl: 'templates/create_shipping_labels.html'
        }
      }
    })

    .state('app.existing_shipping_labels', {
      url: '/existing_shipping_labels/:id',
      views: {
        'menuContent': {
          templateUrl: 'templates/existing_shipping_labels.html'
        }
      }
    })

    .state('app.time_cards', {
      url: '/time_cards/:id',
      views: {
        'menuContent': {
          templateUrl: 'templates/time_cards.html'
        }
      }
    });

    $urlRouterProvider.otherwise('/app/drivers');
})


.factory('authInterceptor', function ($rootScope, $q, $injector, $localStorage, $location, $log) {
  return {
    // Add authorization token to headers
    request: function (config) {
      config.headers = config.headers || {};

      if (config.url.includes('punches')) {
        config.headers['x-access-token'] = $localStorage.mover_token;
      } else if ($localStorage.token) {
        config.headers['x-access-token'] = $localStorage.token;
      } else if($localStorage.mover_token) {
        config.headers['x-access-token'] = $localStorage.mover_token;
      }

      // if this is a location update
      if($localStorage.mover_token && config.url.indexOf('updateLocation') > -1) {
        config.headers['x-access-token'] = $localStorage.mover_token;
      }

      if($localStorage.mover && $localStorage.mover._id) {
        config.headers['mover_id'] = $localStorage.mover._id;
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

.factory('timeoutHttpIntercept', function ($rootScope, $q) {
  return {
    'request': function(config) {
      config.timeout = 60000;
      return config;
    }
  }
})

.run(function ($rootScope, $state, Auth, $ionicPlatform, fencesLocations, $state, $localStorage) {
  // Redirect to login if route requires auth and you're not logged in
  $rootScope.$on('$stateChangeStart', function (event, next) {
    if($localStorage.mover && !$localStorage.mover.tutorialCompleted) {
      $rootScope.isTraining = true;
    }

  });

  $ionicPlatform.on('resume', function(){
    fencesLocations.sendUpdate();
  });

});
