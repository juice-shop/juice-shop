angular.module('juiceShop').factory('ComplaintService', ['$http', '$q', function ($http, $q) {
  'use strict'

  var host = '/api/Complaints'

  function save (params) {
    var createdComplaint = $q.defer()
    $http.post(host + '/', params).then(function (response) {
      createdComplaint.resolve(response.data.data)
    }).catch(function (response) {
      createdComplaint.reject(response.data)
    })
    return createdComplaint.promise
  }

  return {
    save: save
  }
}])
