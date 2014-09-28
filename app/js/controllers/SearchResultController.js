angular.module('myApp').controller('SearchResultController', [
    '$scope',
    '$location',
    '$sce',
    'ProductService',
    '$modal',
    function ($scope, $location, $sce, productService, $modal) {
        'use strict';

        $scope.showDetail = function (id) { // TODO resolve duplication with BestDealsController

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

        $scope.searchQuery = $sce.trustAsHtml($location.search().q);
        productService.search($scope.searchQuery).success(function (data) {
            $scope.products = data.data;
        }).error(function (data) {
            console.log(data);
        });

    }]);