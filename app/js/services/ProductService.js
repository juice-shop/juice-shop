angular.module('juiceShop').factory('ProductService', ['$http', '$q', function ($http, $q) {
  'use strict'

  var host = '/api/Products'

  function find (params) {
    var products = $q.defer()
    $http.get(host + '/', {
      params: params
    }).then(function (response) {
      products.resolve(response.data.data)
    }).catch(function (response) {
      products.reject(response.data)
    })
    return products.promise
  }

  function get (id) {
    var product = $q.defer()
    $http.get(host + '/' + id + '?d=' + encodeURIComponent(new Date().toDateString())).then(function (response) {
      product.resolve(response.data.data)
    }).catch(function (response) {
      product.reject(response.data)
    })
    return product.promise
  }

  function search (criteria) {
    var products = $q.defer()
    $http.get('/rest/product/search?q=' + criteria).then(function (response) {
      products.resolve(response.data.data)
    }).catch(function (response) {
      products.reject(response.data)
    })
    return products.promise
  }

  return {
    find: find,
    get: get,
    search: search
  }
}])
