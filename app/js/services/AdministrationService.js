angular.module('juiceShop').factory('AdministrationService', ['$http', function ($http) {
  'use strict'

  var host = '/rest/admin'

  function getApplicationVersion () {
    return $http.get(host + '/application-version')
  }

  function getSocketUrl () {
    return $http.get(host + '/socket.io')
  }

  return {
    getApplicationVersion: getApplicationVersion,
    getSocketUrl: getSocketUrl
  }
}])
