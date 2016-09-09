angular.module('juiceShop').controller('ComplaintController', [
    '$scope',
    'Upload',
    'ComplaintService',
    'UserService',
    function ($scope, Upload, complaintService, userService) {
        'use strict';

        userService.whoAmI().success(function(data) {
            $scope.complaint = {};
            $scope.complaint.UserId = data.id;
            $scope.userEmail = data.email;
        });

        $scope.save = function () {
            if ($scope.file) {
                $scope.upload($scope.file);
            }
            complaintService.save($scope.complaint).success(function (savedComplaint) {
                $scope.confirmation = 'Customer support will get in touch with you soon! Your complaint reference is #' + savedComplaint.data.id;
                $scope.complaint = {};
                $scope.form.$setPristine();
            });
        };

        $scope.upload = function (file) {
            Upload.upload({
                url: '/rest/fileUpload',
                data: {file: file}
            }).then(function (resp) {
                console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
                $scope.complaint.file = resp.config.data.file.name;
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('Progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                $scope.progress = '(Progress: ' + progressPercentage + '%)';
            });
        };

    }]);