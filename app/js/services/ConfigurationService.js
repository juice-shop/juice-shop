var configCache = null

angular.module('juiceShop').factory('ConfigurationService', ['$http', function ($http) {
  'use strict'

  var host = '/rest/admin'

  function getApplicationConfiguration () {
    if (configCache === null) {
      configCache = $http.get(host + '/application-configuration')
    }

    return configCache
  }

  return {
    getApplicationConfiguration: getApplicationConfiguration
  }
}])
