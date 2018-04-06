angular.module('juiceShop').factory('TrackOrderService', ['$http', '$q', function ($http, $q) {
  'use strict'

  var host = '/rest/track-order'

  function save (params) {
    var trackingInformation = $q.defer()
    $http.get(host + '?id=' + params).success(function (data) {
      trackingInformation.resolve(data)
    }).error(function (err) {
      trackingInformation.reject(err)
    })
    return trackingInformation.promise
  }

  return {
    save: save
  }
}])
