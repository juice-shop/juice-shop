angular.module('juiceShop').controller('AboutController', [
  '$scope',
  'ConfigurationService',
  function ($scope, configurationService) {
    $scope.twitterUrl = null
    $scope.facebookUrl = null
    configurationService.getApplicationConfiguration().then(function (config) {
      if (config && config.application) {
        if (config.application.twitterUrl !== null) {
          $scope.twitterUrl = config.application.twitterUrl
        }
        if (config.application.facebookUrl !== null) {
          $scope.facebookUrl = config.application.facebookUrl
        }
      }
    }).catch(function (err) {
      console.log(err)
    })
  }])
