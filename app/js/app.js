var myApp = angular.module('myApp', [
    'ngRoute',
    'ngCookies',
    'ui.bootstrap'
]);

myApp.factory('authInterceptor', function ($rootScope, $q, $window) {
    'use strict';
    return {
        request: function (config) {
            config.headers = config.headers || {};
            if ($window.sessionStorage.token) {
                config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
            }
            return config;
        },
        response: function (response) {
            if (response.status === 401) {
                console.err('401: ' + response.statusText);
            }
            return response || $q.when(response);
        }
    };
});

myApp.config(function ($httpProvider) {
    'use strict';
    $httpProvider.interceptors.push('authInterceptor');
});

myApp.run(['$window', '$rootScope', function($window, $rootScope) {
    'use strict';
    $rootScope.isLoggedIn = function() {
        return $window.sessionStorage.token;
    }

}]);