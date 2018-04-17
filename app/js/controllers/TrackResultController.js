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
      $scope.results.orderNo = $sce.trustAsHtml(results.data[0].orderNo)
      $scope.results.email = results.data[0].email
      $scope.results.totalPrice = results.data[0].totalPrice
      $scope.results.products = results.data[0].products
      $scope.results.eta = results.data[0].eta
    })
  }])
