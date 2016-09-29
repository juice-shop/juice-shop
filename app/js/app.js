angular.module('juiceShop', [
  'ngRoute',
  'ngCookies',
  'ngTouch',
  'ngAnimate',
  'ngFileUpload',
  'ui.bootstrap',
  'pascalprecht.translate',
  'btford.socket-io'
])

angular.module('juiceShop').factory('authInterceptor', ['$rootScope', '$q', '$cookieStore', function ($rootScope, $q, $cookieStore) {
  'use strict'
  return {
    request: function (config) {
      config.headers = config.headers || {}
      if ($cookieStore.get('token')) {
        config.headers.Authorization = 'Bearer ' + $cookieStore.get('token')
      }
      return config
    },
    response: function (response) {
      return response || $q.when(response)
    }
  }
}])

angular.module('juiceShop').factory('socket', ['socketFactory', function (socketFactory) {
  return socketFactory()
}])

angular.module('juiceShop').config(['$httpProvider', function ($httpProvider) {
  'use strict'
  $httpProvider.interceptors.push('authInterceptor')
}])

angular.module('juiceShop').run(['$cookieStore', '$rootScope', function ($cookieStore, $rootScope) {
  'use strict'
  $rootScope.isLoggedIn = function () {
    return $cookieStore.get('token')
  }
}])

angular.module('juiceShop').config(['$translateProvider', function ($translateProvider) {
  'use strict'
  $translateProvider.useStaticFilesLoader({
    prefix: '/i18n/',
    suffix: '.json'
  })
  $translateProvider.determinePreferredLanguage()
  $translateProvider.fallbackLanguage('en')
}])

