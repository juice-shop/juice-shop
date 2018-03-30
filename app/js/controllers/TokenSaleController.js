angular.module('juiceShop').controller('TokenSaleController', [
  '$scope',
  'ConfigurationService',
  function ($scope, configurationService) {
    $scope.altcoinName = 'Juicycoin'
    configurationService.getApplicationConfiguration().then(function (config) {
      if (config && config.application && config.application.altcoinName !== null) {
        $scope.altcoinName = config.application.altcoinName
      }
    }).catch(function (err) {
      console.log(err)
    })
  }])
