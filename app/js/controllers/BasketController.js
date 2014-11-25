angular.module('myApp').controller('BasketController', [
    '$scope',
    '$sce',
    '$window',
    'BasketService',
    function ($scope, $sce, $window, basketService) {
        'use strict';

        $scope.couponCollapsed = true;
        $scope.paymentCollapsed = true;

        function load() {
            basketService.find($window.sessionStorage.bid).success(function (basket) {
                $scope.products = basket.data.products;
                for (var i=0; i<$scope.products.length; i++) {
                    $scope.products[i].description = $sce.trustAsHtml($scope.products[i].description);
                }
            }).error(function (err) {
                console.log(err);
            });
        }
        load();

        $scope.delete = function (id) {

            basketService.del(id).success(function () {
                load();
            }).error(function (err) {
                console.log(err);
            });

        };

        $scope.applyCoupon = function () {
            basketService.applyCoupon($window.sessionStorage.bid, encodeURIComponent($scope.coupon)).success(function (data) {
                $scope.coupon = undefined;
                $scope.confirmation = 'Discount of ' + data.discount + '% will be applied during checkout.';
                $scope.error = undefined;
                $scope.form.$setPristine();
            }).error(function (error) {
                console.log(error);
                $scope.confirmation = undefined;
                $scope.error = error;
                $scope.form.$setPristine();
            });
        };

        $scope.checkout = function() {
            basketService.checkout($window.sessionStorage.bid).success(function (confirmationUrl) {
                $window.location.replace(confirmationUrl);
            }).error(function (err) {
                console.log(err);
            });
        };

        $scope.inc = function (id) {
            addToQuantity(id, 1);
        };

        $scope.dec = function (id) {
            addToQuantity(id, -1);
        };

        function addToQuantity(id, value) {
            basketService.get(id).success(function (basket) {
                var newQuantity = basket.data.quantity+value;
                basketService.put(id, {quantity: newQuantity > 1 ? newQuantity : 1}).success(function () {
                    load();
                }).error(function (err) {
                    console.log(err);
                });
            }).error(function (err) {
                console.log(err);
            });
        }
    }]);