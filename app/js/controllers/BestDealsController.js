angular.module('myApp').controller('BestDealsController', [
    '$scope',
    '$sce',
    'ProductService',
    '$modal',
    function ($scope, $sce, productService, $modal) {
        'use strict';

        $scope.showDetail = function (id) {

            var productDetailsController = function ($scope) {

                productService.get(id).success(function (data) {
                    $scope.product = data.data;
                    $scope.product.description = $sce.trustAsHtml($scope.product.description);
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
            for (var i=0; i<$scope.products.length; i++) {
                $scope.products[i].description = $sce.trustAsHtml($scope.products[i].description);
            }
        }).error(function (data) {
            console.log(data);
        });

    }]);