angular.module('juiceShop').controller('TrackResultController', [
  '$scope',
  '$sce',
  '$location',
  'TrackOrderService',
  function ($scope, $sce, $location, trackOrderService) {
    'use strict'

    $scope.orderId = $location.search().id
    trackOrderService.save($scope.orderId).then(function (results) {
      $scope.results = {}
      $scope.results.id = $sce.trustAsHtml(results.id)
    })
  }])
