angular.module('juiceShop').controller('SocketController', [
  '$scope',
  'AdministrationService',
  function ($scope, administrationService) {
    'use strict'

    $scope.url = ''

    administrationService.getSocketUrl().success(function (data) {
      if (data && data.url) {
        $scope.url = data.url
      }
    }).error(function (err) {
      console.log(err)
    })
  }])
