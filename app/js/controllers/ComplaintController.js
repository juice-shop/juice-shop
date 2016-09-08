angular.module('juiceShop').controller('ComplaintController', [
    '$scope',
    'ComplaintService',
    'UserService',
    function ($scope, complaintService, userService) {
        'use strict';

        userService.whoAmI().success(function(data) {
            $scope.complaint = {};
            $scope.complaint.UserId = data.id;
            $scope.userEmail = data.email;
        });

        $scope.save = function () {
            complaintService.save($scope.complaint).success(function (savedComplaint) {
                $scope.confirmation = 'Customer support will get in touch with you soon! Your complaint reference is #' + savedComplaint.data.id;
                $scope.complaint = {};
                $scope.form.$setPristine();
            });
        };

    }]);