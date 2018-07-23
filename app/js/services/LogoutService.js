angular.module('juiceShop').factory('LogoutService', ['$http', '$q', function ($http, $q) {
  'use strict'

  var host = '/rest/saveLoginIp'

  function save () {
    var response = $q.defer()
    $http.get(host).then(function (result) {
      response.resolve(result.data)
    }).catch(function (result) {
      response.reject(result.data)
    })
    return response.promise
  }

  return {
    save: save
  }
}])
