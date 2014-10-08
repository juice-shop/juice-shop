angular.module('myApp').controller('UserController', [
    '$scope',
    '$modal',
    'UserService',
    function ($scope, $modal, userService) {
        'use strict';

        function findAll() {
            userService.find().success(function (data) {
                $scope.users = data.data;
            }).error(function (data) {
                console.log(data);
            });
        }
        findAll();

        $scope.showDetail = function (id) {

            $modal.open({
                templateUrl: 'views/UserDetail.html',
                controller: 'UserDetailsController',
                size: 'lg',
                resolve: {
                    id: function () {
                        return id;
                    }
                }
            });
        };

    }]);