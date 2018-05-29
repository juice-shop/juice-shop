angular.module('juiceShop').factory('BasketService', ['$http', '$q', function ($http, $q) {
  'use strict'

  var host = '/api/BasketItems'

  function find (id) {
    var basket = $q.defer()
    $http.get('/rest/basket/' + id).then(function (response) {
      basket.resolve(response.data.data)
    }).catch(function (response) {
      basket.reject(response.data)
    })
    return basket.promise
  }

  function get (id) {
    var basketItem = $q.defer()
    $http.get(host + '/' + id).then(function (response) {
      basketItem.resolve(response.data.data)
    }).catch(function (response) {
      basketItem.reject(response.data)
    })
    return basketItem.promise
  }

  function put (id, params) {
    var updatedBasketItem = $q.defer()
    $http.put(host + '/' + id, params).then(function (response) {
      updatedBasketItem.resolve(response.data.data)
    }).catch(function (response) {
      updatedBasketItem.reject(response.data)
    })
    return updatedBasketItem.promise
  }

  function del (id) {
    var deletedBasketItem = $q.defer()
    $http.delete(host + '/' + id).then(function (response) {
      deletedBasketItem.resolve(response.data.data)
    }).catch(function (response) {
      deletedBasketItem.reject(response.data)
    })
    return deletedBasketItem.promise
  }

  function save (params) {
    var createdBasketItem = $q.defer()
    $http.post(host + '/', params).then(function (response) {
      createdBasketItem.resolve(response.data.data)
    }).catch(function (response) {
      createdBasketItem.reject(response.data)
    })
    return createdBasketItem.promise
  }

  function checkout (id) {
    var orderConfirmationUrl = $q.defer()
    $http.post('/rest/basket/' + id + '/checkout').then(function (response) {
      orderConfirmationUrl.resolve(response.data.orderConfirmation)
    }).catch(function (response) {
      orderConfirmationUrl.reject(response.data)
    })
    return orderConfirmationUrl.promise
  }

  function applyCoupon (id, coupon) {
    var discount = $q.defer()
    $http.put('/rest/basket/' + id + '/coupon/' + coupon).then(function (response) {
      discount.resolve(response.data.discount)
    }).catch(function (response) {
      discount.reject(response.data)
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
