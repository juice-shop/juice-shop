angular.module('juiceShop').factory('ConfigurationService', ['$http', '$q', function ($http, $q) {
  'use strict'

  var host = '/rest/admin'

  function getApplicationConfiguration () {
    var config = $q.defer()
    $http.get(host + '/application-configuration').success(function (data) {
      config.resolve(data.config)
    }).error(function (err) {
      config.reject(err)
    })
    return config.promise
  }

  return {
    getApplicationConfiguration: getApplicationConfiguration
  }
}])
