angular.module('juiceShop').controller('NavbarController', [
  '$scope',
  'AdministrationService',
  function ($scope, administrationService) {
    'use strict'

    $scope.version = ''

    administrationService.getApplicationVersion().success(function (data) {
      if (data && data.version) {
        $scope.version = 'v' + data.version
      }
    }).error(function (err) {
      console.log(err)
    })
  }])
