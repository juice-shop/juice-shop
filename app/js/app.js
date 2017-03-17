angular.module('juiceShop', [
  'ngRoute',
  'ngCookies',
  'ngTouch',
  'ngAnimate',
  'ngFileUpload',
  'ui.bootstrap',
  'pascalprecht.translate',
  'btford.socket-io',
  'ngclipboard',
  'base64',
  'monospaced.qrcode'
])

angular.module('juiceShop').factory('authInterceptor', ['$rootScope', '$q', '$cookies', function ($rootScope, $q, $cookies) {
  'use strict'
  return {
    request: function (requestConfig) {
      requestConfig.headers = requestConfig.headers || {}
      if ($cookies.get('token')) {
        requestConfig.headers.Authorization = 'Bearer ' + $cookies.get('token')
      }
      return requestConfig
    },
    response: function (response) {
      return response || $q.when(response)
    }
  }
}])

angular.module('juiceShop').factory('rememberMeInterceptor', ['$rootScope', '$q', '$cookies', function ($rootScope, $q, $cookies) {
  'use strict'
  return {
    request: function (requestConfig) {
      requestConfig.headers = requestConfig.headers || {}
      if ($cookies.get('email')) {
        requestConfig.headers['X-User-Email'] = $cookies.get('email')
      }
      return requestConfig
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
  $httpProvider.interceptors.push('rememberMeInterceptor')
}])

angular.module('juiceShop').run(['$cookies', '$rootScope', function ($cookies, $rootScope) {
  'use strict'
  $rootScope.applicationName = 'OWASP Juice Shop'
  $rootScope.isLoggedIn = function () {
    return $cookies.get('token')
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
