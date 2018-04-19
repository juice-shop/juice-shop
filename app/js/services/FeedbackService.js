angular.module('juiceShop').factory('FeedbackService', ['$http', '$q', function ($http, $q) {
  'use strict'

  var host = '/api/Feedbacks'

  function find (params) {
    var feedbacks = $q.defer()
    $http.get(host + '/', {
      params: params
    }).then(function (response) {
      feedbacks.resolve(response.data.data)
    }).catch(function (response) {
      feedbacks.reject(response.data)
    })
    return feedbacks.promise
  }

  function save (params) {
    var createdFeedback = $q.defer()
    $http.post(host + '/', params).then(function (response) {
      createdFeedback.resolve(response.data.data)
    }).catch(function (response) {
      createdFeedback.reject(response.data)
    })
    return createdFeedback.promise
  }

  function del (id) {
    var deletedFeedback = $q.defer()
    $http.delete(host + '/' + id).then(function (response) {
      deletedFeedback.resolve(response.data.data)
    }).catch(function (response) {
      deletedFeedback.reject(response.data)
    })
    return deletedFeedback.promise
  }

  return {
    find: find,
    save: save,
    del: del
  }
}])
