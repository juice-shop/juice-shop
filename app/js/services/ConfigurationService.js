angular.module('juiceShop').factory('ConfigurationService', ['$http', function ($http) {
  'use strict'

  var host = '/rest/admin'

  function getApplicationConfiguration () {
    return $http.get(host + '/application-configuration')
  }

  return {
    getApplicationConfiguration: getApplicationConfiguration
  }
}])
