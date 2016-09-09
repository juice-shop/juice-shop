angular.module('juiceShop', [
    'ngRoute',
    'ngCookies',
    'ngTouch',
    'ngAnimate',
    'ngFileUpload',
    'ui.bootstrap'
]);

angular.module('juiceShop').factory('authInterceptor', ['$rootScope', '$q', '$cookieStore', function ($rootScope, $q, $cookieStore) {
    'use strict';
    return {
        request: function (config) {
            config.headers = config.headers || {};
            if ($cookieStore.get('token')) {
                config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
            }
            return config;
        },
        response: function (response) {
            return response || $q.when(response);
        }
    };
}]);

angular.module('juiceShop').config(['$httpProvider', function ($httpProvider) {
    'use strict';
    $httpProvider.interceptors.push('authInterceptor');
}]);

angular.module('juiceShop').run(['$cookieStore', '$rootScope', function ($cookieStore, $rootScope) {
    'use strict';
    $rootScope.isLoggedIn = function () {
        return $cookieStore.get('token');
    };

}]);