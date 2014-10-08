angular.module('myApp').controller('SearchResultController', [
    '$scope',
    '$sce',
    '$window',
    '$modal',
    '$location',
    'ProductService',
    'BasketService',
    function ($scope, $sce, $window, $modal, $location, productService, basketService) {
        'use strict';

        $scope.showDetail = function (id) {

            $modal.open({
                templateUrl: 'views/ProductDetail.html',
                controller: 'ProductDetailsController',
                size: 'lg',
                resolve: {
                    id: function () {
                        return id;
                    }
                }
            });
        };

        $scope.addToBasket = function(id) { // TODO resolve duplication with BestDealsController

            basketService.find($window.sessionStorage.bid).success(function (data) {
                var productsInBasket = data.data.products;
                var found = false;
                for (var i = 0; i < productsInBasket.length; i++) {
                    if (productsInBasket[i].id === id) {
                        found = true;
                        basketService.get(productsInBasket[i].basketItem.id).success(function (data) {
                            var newQuantity = data.data.quantity + 1;
                            basketService.put(data.data.id, {quantity: newQuantity}).success(function (data) {
                                productService.get(data.data.ProductId).success(function(data) {
                                    $scope.confirmation = 'Added another ' + data.data.name  + ' to basket.';
                                }).error(function (data) {
                                    console.log(data);
                                });
                            }).error(function (data) {
                                console.log(data);
                            });
                        }).error(function (data) {
                            console.log(data);
                        });
                        break;
                    }
                }
                if (!found) {
                    basketService.save({ProductId: id, BasketId: $window.sessionStorage.bid, quantity: 1}).success(function (data) {
                        productService.get(data.data.ProductId).success(function(data) {
                            $scope.confirmation = 'Placed ' + data.data.name  + ' into basket.';
                        }).error(function (data) {
                            console.log(data);
                        });
                    }).error(function (data) {
                        console.log(data);
                    });
                }
            }).error(function (data) {
                console.log(data);
            });

        };

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