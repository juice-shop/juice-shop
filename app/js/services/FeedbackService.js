angular.module('juiceShop').factory('FeedbackService', ['$http', function ($http) {
  'use strict'

  var host = '/api/Feedbacks'

  function find (params) {
    return $http.get(host + '/', {
      params: params
    })
  }

  function save (params) {
    return $http.post(host + '/', params)
  }

  function del (id) {
    return $http.delete(host + '/' + id)
  }

  return {
    find: find,
    save: save,
    del: del
  }
}])
