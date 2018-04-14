angular.module('juiceShop').factory('SecurityQuestionService', ['$http', '$q', function ($http, $q) {
  'use strict'

  var host = '/api/SecurityQuestions'

  function find (params) {
    var securityQuestions = $q.defer()
    $http.get(host + '/', {
      params: params
    }).then(function (response) {
      securityQuestions.resolve(response.data.data)
    }).catch(function (response) {
      securityQuestions.reject(response.data)
    })
    return securityQuestions.promise
  }

  function findBy (email) {
    var securityQuestion = $q.defer()
    $http.get('rest/user/security-question?email=' + email).then(function (response) {
      securityQuestion.resolve(response.data.question)
    }).catch(function (err) {
      securityQuestion.reject(err)
    })
    return securityQuestion.promise
  }

  return {
    find: find,
    findBy: findBy
  }
}])
