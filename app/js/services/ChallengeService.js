angular.module('juiceShop').factory('ChallengeService', ['$http', function ($http) {
  'use strict'

  var host = '/api/Challenges'

  function find (params) {
    return $http.get(host + '/', {
      params: params
    })
  }

  function repeatNotification (challengeName) {
      return $http.get('/rest/repeat-notification', {
          params: {
            challenge: challengeName
          }
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
    repeatNotification: repeatNotification,
    continueCode: continueCode,
    restoreProgress: restoreProgress
  }
}])
