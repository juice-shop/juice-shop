angular.module('juiceShop').controller('RecycleController', [
  '$scope',
  'RecycleService',
  'UserService',
  function ($scope, recycleService, userService) {
    'use strict'

    userService.whoAmI().then(function (data) {
      $scope.recycle = {}
      $scope.recycle.UserId = data.id
      $scope.userEmail = data.email
    })

    $scope.save = function () {
      recycleService.save($scope.recycle).then(function (savedRecycle) {
        $scope.confirmation = 'Thank you for using our recycling service. We will ' + (savedRecycle.isPickup ? ('pick up your pomace on ' + savedRecycle.pickupDate) : 'deliver your recycle box asap') + '.'
        $scope.recycle = {}
        $scope.form.$setPristine()
      })
    }
  }])
