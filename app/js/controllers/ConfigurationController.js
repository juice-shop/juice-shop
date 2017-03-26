angular.module('juiceShop').controller('ConfigurationController', [
  '$scope',
  'ConfigurationService',
  function ($scope, configurationService) {
    'use strict'

    $scope.configuration = {}

    configurationService.getApplicationConfiguration().success(function (data) {
      if (data) {
        $scope.configuration = data
      }
    }).error(function (err) {
      console.log(err)
    })
  }])
