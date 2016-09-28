angular.module('juiceShop').factory('AdministrationService', ['$http', function ($http) {
  'use strict'

  var host = '/rest/admin'

  function getApplicationVersion () {
    return $http.get(host + '/application-version')
  }

  return {
    getApplicationVersion: getApplicationVersion
  }
}])
