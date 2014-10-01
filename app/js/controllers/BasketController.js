angular.module('myApp').controller('BasketController', [
    '$scope',
    '$sce',
    '$window',
    'BasketService',
    function ($scope, $sce, $window, basketService) {
        'use strict';

        basketService.get($window.sessionStorage.bid).success(function (data) {
            $scope.products = data.data.products;
            for (var i=0; i<$scope.products.length; i++) {
                $scope.products[i].description = $sce.trustAsHtml($scope.products[i].description);
            }
        }).error(function (data) {
            console.log(data);
        });

    }]);