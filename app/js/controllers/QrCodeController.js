angular.module('juiceShop').controller('QrCodeController', [
  '$scope',
  'data',
  'url',
  'address',
  'title',
  function ($scope, data, url, address, title) {
    $scope.data = data
    $scope.url = url
    $scope.address = address
    $scope.title = title
  }])
