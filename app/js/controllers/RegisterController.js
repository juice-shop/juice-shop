angular.module('juiceShop').controller('RegisterController', [
  '$scope',
  '$location',
  'UserService',
  function ($scope, $location, userService) {
    'use strict'

    $scope.save = function () {
      userService.save($scope.user).then(function () {
        $scope.user = {}
        $location.path('/login')
      })
    }
  }])
