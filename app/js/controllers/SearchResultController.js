angular.module('myApp').controller('SearchResultController', [
    '$scope',
    '$location',
    '$sce',
    'ProductService',
    'BasketService',
    '$modal',
    function ($scope, $location, $sce, productService, basketService, $modal) {
        'use strict';

        $scope.showDetail = function (id) { // TODO resolve duplication with BestDealsController

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

        $scope.addToBasket = function(id) { // TODO resolve duplication with BestDealsController

        }

        $scope.searchQuery = $sce.trustAsHtml($location.search().q);

        productService.search($scope.searchQuery).success(function (data) {
            $scope.products = data.data;
            for (var i=0; i<$scope.products.length; i++) {
                $scope.products[i].description = $sce.trustAsHtml($scope.products[i].description);
            }
        }).error(function (data) {
            console.log(data);
        });

    }]);