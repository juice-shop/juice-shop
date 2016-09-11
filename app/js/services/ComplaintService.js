angular.module('juiceShop').factory('ComplaintService', ['$http', function ($http) {
  'use strict'

  var host = '/api/Complaints'

  function save (params) {
    return $http.post(host + '/', params)
  }

  return {
    save: save
  }
}])
