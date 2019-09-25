var app = angular.module('tzatziki',['patternfly.navigation', 'patternfly.pagination', 'patternfly.select', 'patternfly.charts', 'patternfly.card', 'patternfly.toolbars', 'patternfly.notification', 'patternfly.modals', 'patternfly.table', 'ui.router', 'ngDragDrop', 'angular-loading-bar']);

app.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('dashboard');

  $stateProvider
    .state('live', {
      url: '/live',
      templateUrl: 'views/live.html',
      controller: 'LiveCtrl',
      resolve: {
        version: function(initialData) {
          return initialData.getVersion();
        },
        liveConnections: function(initialData) {
          return initialData.getLiveConnections(false);
        }
      }
    })
    .state('history', {
      url: '/history',
      templateUrl: 'views/history.html',
      controller: 'HistoryCtrl',
      resolve: {
        version: function(initialData) {
          return initialData.getVersion();
        },
        connectionHistory: function(initialData) {
          return initialData.getConnectionHistory(false);
        }
      }
    })
    .state('dashboard', {
      url: '/dashboard',
      templateUrl: 'views/dashboard.html',
      controller: 'DashboardCtrl',
      resolve: {
        version: function(initialData) {
          return initialData.getVersion();
        },
        guacamoleUrl: function(initialData) {
          return initialData.getGuacamoleUrl();
        },
        connectionHistory: function(initialData) {
          return initialData.getConnectionHistory(false);
        },
        liveConnections: function(initialData) {
          return initialData.getLiveConnections(false);
        }
      }
    });
});

app.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
  cfpLoadingBarProvider.includeBar = false;
}]);

// app.service('authInterceptor', function($q, $rootScope, Notifications) {
//   var service = this;
//   service.responseError = function(response) {
//     if (response.status == 401){
//       window.location = "#/login";
//     }
//     return $q.reject(response);
//   };
// });

app.factory('timeoutHttpIntercept', function ($rootScope, $q) {
  return {
    'request': function(config) {
      config.timeout = 20000;
      return config;
    }
  };
 });

app.config(['$httpProvider', function($httpProvider) {
    // $httpProvider.interceptors.push('authInterceptor');
    $httpProvider.interceptors.push('timeoutHttpIntercept');
    $httpProvider.defaults.timeout = 20000;
}]);

app.constant('_', window._);

app.run( ['$rootScope', '$state', '$stateParams', 'Notifications', function ($rootScope, $state, $stateParams, Notifications) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
  $rootScope.$on('cfpLoadingBar:loading', function (event, data) {
    $rootScope.bodyOpacity = '0.2';
  });
  $rootScope.$on('cfpLoadingBar:completed', function (event, data) {
    $rootScope.bodyOpacity = '1';
  });
  $rootScope.handleNotificationClose = function (data) {
    Notifications.remove(data);
  };
}]);

app.factory('$localstorage', function($window) {
  return {
    put: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key) {
      return $window.localStorage[key] || null;
    },
    putObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || null);
    }
  };
});

app.factory("initialData", function($q, $http, $rootScope, $localstorage, Notifications){
  return {
    getConnectionHistory: function(ignoreBar){
      var deferred = $q.defer();
      var connections = [];
      $http.get('/api/v1/guacamole/connection/history', {ignoreLoadingBar: ignoreBar})
        .success(function(connections) {
          deferred.resolve(connections);
        })
        .error(function(err) {
          Notifications.message (
            'warning',
            'Error',
            'An error has occured while contacting the server. Please check your connection or contact an administrator.',
            false
          );
          $rootScope.notifications = Notifications.data;
          console.log(err);
          deferred.reject(err);
        });
      return deferred.promise;
    },
    getLiveConnections: function(ignoreBar){
      var deferred = $q.defer();
      var connections = [];
      $http.get('/api/v1/guacamole/connection/active', {ignoreLoadingBar: ignoreBar})
        .success(function(connections) {
          deferred.resolve(connections);
        })
        .error(function(err) {
          Notifications.message (
            'warning',
            'Error',
            'An error has occured while contacting the server. Please check your connection or contact an administrator.',
            false
          );
          $rootScope.notifications = Notifications.data;
          console.log(err);
          deferred.reject(err);
        });
      return deferred.promise;
    },
    getVersion: function() {
      var deferred = $q.defer();
      $http.get('/api/v1/version', {ignoreLoadingBar: true})
        .success(function(version) {
          $rootScope.version = version;
          $rootScope.versionError = null;
          deferred.resolve();
        })
        .error(function(err) {
          $rootScope.versionError = err;
          deferred.reject(err);
        });
      return deferred.promise;
    },
    getGuacamoleUrl: function() {
      var deferred = $q.defer();
      $http.get('/api/v1/guacamole/url', {ignoreLoadingBar: true})
        .success(function(url) {
          deferred.resolve(url);
        })
        .error(function(err) {
          console.log(err);
        });
      return deferred.promise;
    }
  };
});
