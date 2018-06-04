angular.module('juiceShop').controller('TrackResultController', [
  '$scope',
  '$sce',
  '$location',
  'TrackOrderService',
  function ($scope, $sce, $location, trackOrderService) {
    'use strict'

    $scope.orderId = $location.search().id
    trackOrderService.track($scope.orderId).then(function (results) {
      $scope.results = {}
      $scope.results.orderId = $sce.trustAsHtml(results.data[0].orderId)
      $scope.results.email = results.data[0].email
      $scope.results.totalPrice = results.data[0].totalPrice
      $scope.results.products = results.data[0].products
      $scope.results.eta = results.data[0].eta
    })
  }])
