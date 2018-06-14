angular.module('juiceShop').factory('ProductReviewService', ['$http', '$q', function ($http, $q) {
  'use strict'

  var host = '/rest/product'

  function get (id) {
    var review = $q.defer()
    $http.get(host + '/' + id + '/reviews').then(function (response) {
      review.resolve(response.data.data)
    }).catch(function (response) {
      review.reject(response.data)
    })
    return review.promise
  }

  function create (id, review) {
    var createdReview = $q.defer()
    $http.put(host + '/' + id + '/reviews', review).then(function (response) {
      createdReview.resolve(response.data.data)
    }).catch(function (response) {
      createdReview.reject(response.data)
    })
    return createdReview.promise
  }

  function patch (review) {
    var updatedReview = $q.defer()
    $http.patch(host + '/reviews', review).then(function (response) {
      updatedReview.resolve(response.data.data)
    }).catch(function (response) {
      updatedReview.reject(response.data)
    })
    return updatedReview.promise
  }

  function like (id) {
    var updatedReview = $q.defer()
    var id = {id: id}
    $http.post(host + '/reviews', id).then(function (response) {
      updatedReview.resolve(response.data.data)
    }).catch(function (response) {
      updatedReview.reject(response.data)
    })
    return updatedReview.promise
  }

  return {
    get: get,
    create: create,
    patch: patch,
    like: like
  }
}])
