angular.module('juiceShop').controller('ChangePasswordController', [
  '$scope',
  '$location',
  'UserService',
  function ($scope, $location, userService) {
    'use strict'

    $scope.changePassword = function () {
      userService.changePassword({ current: $scope.currentPassword, new: $scope.newPassword, repeat: $scope.newPasswordRepeat }).then(function () {
        $scope.error = undefined
        $scope.confirmation = 'Your password was successfully changed.'
        resetForm()
      }).catch(function (error) {
        $scope.error = error
        $scope.confirmation = undefined
        resetForm()
      })
    }

    function resetForm () {
      $scope.currentPassword = undefined
      $scope.newPassword = undefined
      $scope.newPasswordRepeat = undefined
      $scope.form.$setPristine()
    }
  }])
