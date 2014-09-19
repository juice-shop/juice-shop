angular.module('myApp').controller('BestDealsController', [
    '$scope',
    'ProductService',
    '$modal',
    function ($scope, productService, $modal) {

        productService.find().success(function (data) {
            $scope.products = data.data;
        }).error(function (data) {
            console.log(data);
        });

    }]);