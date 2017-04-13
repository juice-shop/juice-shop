angular.module('juiceShop').factory('ChallengeService', ['$http', '$q', function ($http, $q) {
  'use strict'

  var host = '/api/Challenges'

  function find (params) {
    var challenges = $q.defer()
    $http.get(host + '/', { params: params }).success(function (data) {
      challenges.resolve(data.data)
    }).error(function (err) {
      challenges.reject(err)
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
    $http.get('/rest/continue-code').success(function (data) {
      continueCode.resolve(data.continueCode)
    }).error(function (err) {
      continueCode.reject(err)
    })
    return continueCode.promise
  }

  function restoreProgress (continueCode) {
    var result = $q.defer()
    $http.put('/rest/continue-code/apply/' + continueCode).success(function (data) {
      result.resolve(data)
    }).error(function (err) {
      result.reject(err)
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
