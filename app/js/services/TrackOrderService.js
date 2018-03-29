angular.module('juiceShop').factory('TrackOrderService', ['$http', '$q', function ($http, $q) {
  'use strict'

  var host = '/rest/track-order'

  function save (params) {
    var trackingInformation = $q.defer()
    $http.post(host + '/', params).success(function (data) {
      trackingInformation.resolve(data.data)
    }).error(function (err) {
      trackingInformation.reject(err)
    })
    console.log(trackingInformation.promise)
    return trackingInformation.promise
  }

  return {
    save: save
  }
}])
