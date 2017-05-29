angular.module('juiceShop').factory('RecycleService', ['$http', '$q', function ($http, $q) {
  'use strict'

  var host = '/api/Recycles'

  function find (params) {
    var recycles = $q.defer()
    $http.get(host + '/', {params: params}).success(function (data) {
      recycles.resolve(data.data)
    }).error(function (err) {
      recycles.reject(err)
    })
    return recycles.promise
  }

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
    find: find,
    save: save
  }
}])
