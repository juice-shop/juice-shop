angular.module('juiceShop').controller('ProductDetailsController', [
  '$scope',
  '$sce',
  '$uibModal',
  'ProductService',
  'id',
  function ($scope, $sce, $uibModal, productService, id) {
    'use strict'

    productService.get(id).success(function (product) {
      $scope.product = product.data
      $scope.product.description = $sce.trustAsHtml($scope.product.description)
    }).error(function (err) {
      console.log(err)
    })
  }])
