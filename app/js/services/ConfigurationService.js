angular.module('juiceShop').factory('ConfigurationService', ['$http', '$q', function ($http, $q) {
  'use strict'

  var host = '/rest/admin'

  function getApplicationConfiguration () {
    var config = $q.defer()
    $http.get(host + '/application-configuration').then(function (response) {
      config.resolve(response.data.config)
    }).catch(function (response) {
      config.reject(response.data)
    })
    return config.promise
  }

  return {
    getApplicationConfiguration: getApplicationConfiguration
  }
}])
