angular.module('juiceShop').controller('UserDetailsController', [
  '$scope',
  '$uibModal',
  'UserService',
  'id',
  function ($scope, $uibModal, userService, id) {
    'use strict'

    userService.get(id).then(function (user) {
      $scope.user = user
    }).catch(function (err) {
      console.log(err)
    })
  }])
