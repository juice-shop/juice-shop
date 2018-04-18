angular.module('juiceShop').factory('TrackOrderService', ['$http', '$q', function ($http, $q) {
  'use strict'

  var host = '/rest/track-order'

  function save (params) {
    var trackingInformation = $q.defer()
    $http.get(host + '?id=' + params).then(function (response) {
      trackingInformation.resolve(response.data)
    }).catch(function (response) {
      trackingInformation.reject(response.data)
    })
    return trackingInformation.promise
  }

  return {
    save: save
  }
}])
