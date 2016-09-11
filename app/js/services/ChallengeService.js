angular.module('juiceShop').factory('ChallengeService', ['$http', function ($http) {
  'use strict'

  var host = '/api/Challenges'

  function find (params) {
    return $http.get(host + '/', {
      params: params
    })
  }

  return {
    find: find
  }
}])
