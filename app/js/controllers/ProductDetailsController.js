angular.module('myApp').controller('ProductDetailsController', [
    '$scope',
    '$sce',
    '$modal',
    'ProductService',
    'id',
    function ($scope, $sce, $modal, productService, id) {
        'use strict';

        productService.get(id).success(function (data) {
            $scope.product = data.data;
            $scope.product.description = $sce.trustAsHtml($scope.product.description);
        }).error(function (data) {
            console.log(data);
        });

    }]);