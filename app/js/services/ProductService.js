angular.module('juiceShop').factory('ProductService', ['$http', '$q', function ($http, $q) {
  'use strict'

  var host = '/api/Products'

  function find (params) {
    var products = $q.defer()
    $http.get(host + '/', {params: params}).success(function (data) {
      products.resolve(data.data)
    }).error(function (err) {
      products.reject(err)
    })
    return products.promise
  }

  function get (id) {
    var product = $q.defer()
    $http.get(host + '/' + id + '?d=' + encodeURIComponent(new Date().toDateString())).success(function (data) {
      product.resolve(data.data)
    }).error(function (err) {
      product.reject(err)
    })
    return product.promise
  }

  function search (criteria) {
    var products = $q.defer()
    $http.get('/rest/product/search?q=' + criteria).success(function (data) {
      products.resolve(data.data)
    }).error(function (err) {
      products.reject(err)
    })
    return products.promise
  }

  return {
    find: find,
    get: get,
    search: search
  }
}])
