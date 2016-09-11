angular.module('juiceShop').controller('UserDetailsController', [
  '$scope',
  '$uibModal',
  'UserService',
  'id',
  function ($scope, $uibModal, userService, id) {
    'use strict'

    userService.get(id).success(function (user) {
      $scope.user = user.data
    }).error(function (err) {
      console.log(err)
    })
  }])
