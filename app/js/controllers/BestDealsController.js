angular.module('myApp').controller('BestDealsController', [
    '$scope',
    '$sce',
    '$window',
    'ProductService',
    'BasketService',
    '$modal',
    function ($scope, $sce, $window, productService, basketService, $modal) {
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

        $scope.addToBasket = function (id) {

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

        productService.find().success(function (data) {
            $scope.products = data.data;
            for (var i = 0; i < $scope.products.length; i++) {
                $scope.products[i].description = $sce.trustAsHtml($scope.products[i].description);
            }
        }).error(function (data) {
            console.log(data);
        });

    }]);