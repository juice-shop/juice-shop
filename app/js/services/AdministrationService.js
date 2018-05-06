angular.module('juiceShop').factory('AdministrationService', ['$http', '$q', function ($http, $q) {
  'use strict'

  var host = '/rest/admin'

  function getApplicationVersion () {
    var version = $q.defer()
    $http.get(host + '/application-version').then(function (response) {
      version.resolve(response.data.version)
    }).catch(function (response) {
      version.reject(response.data)
    })
    return version.promise
  }

  return {
    getApplicationVersion: getApplicationVersion
  }
}])
