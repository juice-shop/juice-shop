angular.module('juiceShop').controller('TrackOrderController', [
  '$scope',
  'TrackOrderService',
  function ($scope, trackOrderService) {
    'use strict'

    $scope.order = {}

    $scope.save = function () {
      trackOrderService.save($scope.order).then(function (savedFeedback) {
        $scope.error = null
        $scope.order = {}
        $scope.form.$setPristine()
      }).catch(function (error) {
        $scope.error = error
        $scope.order = {}
        $scope.form.$setPristine()
      })
    }
  }])
