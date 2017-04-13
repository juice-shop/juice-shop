angular.module('juiceShop').controller('ProductDetailsController', [
  '$scope',
  '$sce',
  '$uibModal',
  'ProductService',
  'id',
  function ($scope, $sce, $uibModal, productService, id) {
    'use strict'

    productService.get(id).then(function (product) {
      $scope.product = product
      $scope.product.description = $sce.trustAsHtml($scope.product.description)
    }).catch(function (err) {
      console.log(err)
    })
  }])
