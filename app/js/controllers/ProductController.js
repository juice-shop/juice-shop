angular.module('myApp').controller('ProductController', [
    '$scope',
    'ProductService',
    '$modal',
    function ($scope, productService, $modal) {
        'use strict';

        $scope.showDetail = function (id) {

            var productDetailsController = function ($scope) {

                productService.get(id).success(function (data) {
                    $scope.product = data.data;
                }).error(function (data) {
                    console.log(data);
                });
            };

            $modal.open({
                templateUrl: 'views/ProductDetail.html',
                controller: productDetailsController,
                size: 'lg'
            });
        };

        productService.find().success(function (data) {
            $scope.products = data.data;
        }).error(function (data) {
            console.log(data);
        });

    }]);