angular.module('juiceShop').factory('ChallengeService', ['$http', '$q', function ($http, $q) {
  'use strict'

  var host = '/api/Challenges'

  function find (params) {
    var challenges = $q.defer()
    $http.get(host + '/', {
      params: params
    }).then(function (response) {
      challenges.resolve(response.data.data)
    }).catch(function (response) {
      challenges.reject(response.data)
    })
    return challenges.promise
  }

  function repeatNotification (challengeName) {
    return $http.get('/rest/repeat-notification', {
      params: {
        challenge: challengeName
      }
    })
  }

  function continueCode () {
    var continueCode = $q.defer()
    $http.get('/rest/continue-code').then(function (response) {
      continueCode.resolve(response.data.continueCode)
    }).catch(function (response) {
      continueCode.reject(response.data)
    })
    return continueCode.promise
  }

  function restoreProgress (continueCode) {
    var result = $q.defer()
    $http.put('/rest/continue-code/apply/' + continueCode).then(function (response) {
      result.resolve(response.data)
    }).catch(function (response) {
      result.reject(response.data)
    })
    return result.promise
  }

  return {
    find: find,
    repeatNotification: repeatNotification,
    continueCode: continueCode,
    restoreProgress: restoreProgress
  }
}])
