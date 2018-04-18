angular.module('juiceShop').controller('TrackOrderController', [
  '$scope',
  '$location',
  function ($scope, $location) {
    'use strict'

    $scope.save = function () {
      $location.path('/track-result').search({id: $scope.orderId || ''})
    }
  }])
