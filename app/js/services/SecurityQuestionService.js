angular.module('juiceShop').factory('SecurityQuestionService', ['$http', '$q', function ($http, $q) {
  'use strict'

  var host = '/api/SecurityQuestions'

  function find (params) {
    var securityQuestions = $q.defer()
    $http.get(host + '/', { params: params }).success(function (data) {
      securityQuestions.resolve(data.data)
    }).error(function (err) {
      securityQuestions.reject(err)
    })
    return securityQuestions.promise
  }

  return {
    find: find
  }
}])
