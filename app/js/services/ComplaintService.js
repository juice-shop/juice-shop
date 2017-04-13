angular.module('juiceShop').factory('ComplaintService', ['$http', '$q', function ($http, $q) {
  'use strict'

  var host = '/api/Complaints'

  function save (params) {
    var createdComplaint = $q.defer()
    $http.post(host + '/', params).success(function (data) {
      createdComplaint.resolve(data.data)
    }).error(function (err) {
      createdComplaint.reject(err)
    })
    return createdComplaint.promise
  }

  return {
    save: save
  }
}])
