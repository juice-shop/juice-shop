angular.module('juiceShop').factory('BasketService', ['$http', function ($http) {
  'use strict'

  var host = '/api/BasketItems'

  function find (id) {
    return $http.get('/rest/basket/' + id)
  }

  function get (id) {
    return $http.get(host + '/' + id)
  }

  function put (id, params) {
    return $http.put(host + '/' + id, params)
  }

  function del (id) {
    return $http.delete(host + '/' + id)
  }

  function checkout (id) {
    return $http.post('/rest/basket/' + id + '/checkout')
  }

  function applyCoupon (id, coupon) {
    return $http.put('/rest/basket/' + id + '/coupon/' + coupon)
  }

  function save (params) {
    return $http.post(host + '/', params)
  }

  return {
    find: find,
    get: get,
    put: put,
    del: del,
    checkout: checkout,
    applyCoupon: applyCoupon,
    save: save
  }
}])
