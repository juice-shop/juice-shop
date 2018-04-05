angular.module('juiceShop').factory('TrackOrderService', ['$http', '$q', function ($http, $q) {
  'use strict'

  var host = '/rest/track-order'

  function save (params) {
    var trackingInformation = $q.defer()
    $http.post(host + '/', params).then(function (response) {
      trackingInformation.resolve(response.data.data)
    }).catch(function (response) {
      trackingInformation.reject(response.data)
    })
    console.log(trackingInformation.promise)
    return trackingInformation.promise
  }

  return {
    save: save
  }
}])
