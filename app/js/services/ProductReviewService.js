angular.module('juiceShop').factory('ProductReviewService', ['$http', '$q', function ($http, $q) {
  'use strict'

  var host = '/rest/product'

  function get (id) {
    var review = $q.defer()
    $http.get(host + '/' + id + '/reviews').success(function (data) {
      review.resolve(data.data)
    }).error(function (err) {
      review.reject(err)
    })
    return review.promise
  }

  function create (id, review) {
    var createdReview = $q.defer()
    $http.put(host + '/' + id + '/reviews', review).success(function (data) {
      createdReview.resolve(data.data)
    }).error(function (err) {
      createdReview.reject(err)
    })
    return createdReview.promise
  }

  function patch (review) {
    var updatedReview = $q.defer()
    $http.patch(host + '/reviews', review).success(function (data) {
      updatedReview.resolve(data.data)
    }).error(function (err) {
      updatedReview.reject(err)
    })
    return updatedReview.promise
  }

  return {
    get: get,
    create: create,
    patch: patch
  }
}])
