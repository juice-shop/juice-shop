angular.module('myApp').controller('ProductDetailsController', [
    '$scope',
    '$sce',
    '$modal',
    'ProductService',
    'id',
    function ($scope, $sce, $modal, productService, id) {
        'use strict';

        productService.get(id).success(function (product) {
            $scope.product = product.data;
            $scope.product.description = $sce.trustAsHtml($scope.product.description);
        }).error(function (err) {
            console.log(err);
        });

    }]);