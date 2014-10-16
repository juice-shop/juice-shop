angular.module('myApp').controller('UserController', [
    '$scope',
    '$modal',
    'UserService',
    function ($scope, $modal, userService) {
        'use strict';

        function findAll() {
            userService.find().success(function (users) {
                $scope.users = users.data;
            }).error(function (err) {
                console.log(err);
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