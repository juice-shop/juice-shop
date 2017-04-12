angular.module('juiceShop').factory('BasketService', ['$http', '$q', function ($http, $q) {
  'use strict'

  var host = '/api/BasketItems'

  function find (id) {
    var basket = $q.defer()
    $http.get('/rest/basket/' + id).success(function (data) {
      basket.resolve(data.data)
    }).error(function (err) {
      basket.reject(err)
    })
    return basket.promise
  }

  function get (id) {
    var basketItem = $q.defer()
    $http.get(host + '/' + id).success(function (data) {
      basketItem.resolve(data.data)
    }).error(function (err) {
      basketItem.reject(err)
    })
    return basketItem.promise
  }

  function put (id, params) {
    var updatedBasketItem = $q.defer()
    $http.put(host + '/' + id, params).success(function (data) {
      updatedBasketItem.resolve(data.data)
    }).error(function (err) {
      updatedBasketItem.reject(err)
    })
    return updatedBasketItem.promise
  }

  function del (id) {
    var deletedBasketItem = $q.defer()
    $http.delete(host + '/' + id).success(function (data) {
      deletedBasketItem.resolve(data.data)
    }).error(function (err) {
      deletedBasketItem.reject(err)
    })
    return deletedBasketItem.promise
  }

  function save (params) {
    var createdBasketItem = $q.defer()
    $http.post(host + '/', params).success(function (data) {
      createdBasketItem.resolve(data.data)
    }).error(function (err) {
      createdBasketItem.reject(err)
    })
    return createdBasketItem.promise
  }

  function checkout (id) {
    var orderConfirmationUrl = $q.defer()
    $http.post('/rest/basket/' + id + '/checkout').success(function (data) {
      orderConfirmationUrl.resolve(data.orderConfirmation)
    }).error(function (err) {
      orderConfirmationUrl.reject(err)
    })
    return orderConfirmationUrl.promise
  }

  function applyCoupon (id, coupon) {
    var discount = $q.defer()
    $http.put('/rest/basket/' + id + '/coupon/' + coupon).success(function (data) {
      discount.resolve(data.discount)
    }).error(function (err) {
      discount.reject(err)
    })
    return discount.promise
  }

  return {
    find: find,
    get: get,
    put: put,
    del: del,
    save: save,
    checkout: checkout,
    applyCoupon: applyCoupon
  }
}])
