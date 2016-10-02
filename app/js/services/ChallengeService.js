angular.module('juiceShop').factory('ChallengeService', ['$http', function ($http) {
  'use strict'

  var host = '/api/Challenges'

  function find (params) {
    return $http.get(host + '/', {
      params: params
    })
  }

  function continueCode () {
    return $http.get('/rest/continue-code')
  }

  function restoreProgress (continueCode) {
    return $http.put('/rest/continue-code/apply/' + continueCode)
  }

  return {
    find: find,
    continueCode: continueCode,
    restoreProgress: restoreProgress
  }
}])
