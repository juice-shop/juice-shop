angular.module('juiceShop').factory('SecurityAnswerService', ['$http', '$q', function ($http, $q) {
  'use strict'

  var host = '/api/SecurityAnswers'

  function save (params) {
    var createdSecurityAnswer = $q.defer()
    $http.post(host + '/', params).success(function (data) {
      createdSecurityAnswer.resolve(data.data)
    }).error(function (err) {
      createdSecurityAnswer.reject(err)
    })
    return createdSecurityAnswer.promise
  }

  return {
    save: save
  }
}])
