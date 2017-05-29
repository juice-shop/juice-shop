angular.module('juiceShop').factory('RecycleService', ['$http', '$q', function ($http, $q) {
  'use strict'

  var host = '/api/Recycles'

  function save (params) {
    var createdRecycle = $q.defer()
    $http.post(host + '/', params).success(function (data) {
      createdRecycle.resolve(data.data)
    }).error(function (err) {
      createdRecycle.reject(err)
    })
    return createdRecycle.promise
  }

  return {
    save: save
  }
}])
