angular.module('juiceShop').factory('AdministrationService', ['$http', '$q', function ($http, $q) {
  'use strict'

  var host = '/rest/admin'

  function getApplicationVersion () {
    var version = $q.defer()
    $http.get(host + '/application-version').success(function (data) {
      version.resolve(data.version)
    }).error(function (err) {
      version.reject(err)
    })
    return version.promise
  }

  return {
    getApplicationVersion: getApplicationVersion
  }
}])
