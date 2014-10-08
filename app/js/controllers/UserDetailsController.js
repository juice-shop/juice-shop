angular.module('myApp').controller('UserDetailsController', [
    '$scope',
    '$modal',
    'UserService',
    'id',
    function ($scope, $modal, userService, id) {
        'use strict';

            userService.get(id).success(function (data) {
                $scope.user = data.data;
            }).error(function (data) {
                console.log(data);
            });

    }]);