angular.module('juiceShop').factory('SecurityAnswerService', ['$http', '$q', function ($http, $q) {
  'use strict'

  var host = '/api/SecurityAnswers'

  function save (params) {
    var createdSecurityAnswer = $q.defer()
    $http.post(host + '/', params).then(function (response) {
      createdSecurityAnswer.resolve(response.data.data)
    }).catch(function (response) {
      createdSecurityAnswer.reject(response.data)
    })
    return createdSecurityAnswer.promise
  }

  return {
    save: save
  }
}])
