angular.module('myApp').controller('UserDetailsController', [
    '$scope',
    '$modal',
    'UserService',
    'id',
    function ($scope, $modal, userService, id) {
        'use strict';

            userService.get(id).success(function (user) {
                $scope.user = user.data;
            }).error(function (err) {
                console.log(err);
            });

    }]);