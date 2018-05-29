angular.module('juiceShop').factory('RecycleService', ['$http', '$q', function ($http, $q) {
  'use strict'

  var host = '/api/Recycles'

  function find (params) {
    var recycles = $q.defer()
    $http.get(host + '/', {
      params: params
    }).then(function (response) {
      recycles.resolve(response.data.data)
    }).catch(function (response) {
      recycles.reject(response.data)
    })
    return recycles.promise
  }

  function save (params) {
    var createdRecycle = $q.defer()
    $http.post(host + '/', params).then(function (response) {
      createdRecycle.resolve(response.data.data)
    }).catch(function (response) {
      createdRecycle.reject(response.data)
    })
    return createdRecycle.promise
  }

  return {
    find: find,
    save: save
  }
}])
