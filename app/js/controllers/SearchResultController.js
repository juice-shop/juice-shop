angular.module('myApp').controller('SearchResultController', [
    '$scope',
    '$location',
    '$sce',
    'ProductService',
    function ($scope, $location, $sce, productService) {
        'use strict';

        $scope.searchQuery = $sce.trustAsHtml($location.search().q);

    }]);