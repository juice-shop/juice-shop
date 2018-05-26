angular.module('juiceShop').controller('ComplaintController', [
  '$scope',
  'Upload',
  'ComplaintService',
  'UserService',
  function ($scope, Upload, complaintService, userService) {
    'use strict'

    function initComplaint () {
      userService.whoAmI().then(function (user) {
        $scope.complaint = {}
        $scope.complaint.UserId = user.id
        $scope.userEmail = user.email
      }).catch(angular.noop)
    }

    function saveComplaint () {
      complaintService.save($scope.complaint).then(function (savedComplaint) {
        $scope.confirmation = 'Customer support will get in touch with you soon! Your complaint reference is #' + savedComplaint.id
        initComplaint()
        $scope.file = undefined
        $scope.form.$setPristine()
      }).catch(angular.noop)
    }

    initComplaint()

    $scope.save = function () {
      if ($scope.file) {
        $scope.upload($scope.file)
      } else {
        saveComplaint()
      }
    }

    $scope.upload = function (file) {
      Upload.upload({
        url: '/file-upload',
        data: {file: file}
      }).then(function (req) {
        console.log(req)
        $scope.complaint.file = req.config.data.file.name
        saveComplaint()
      }, function (res) {
        console.log('Error status: ' + res.status)
        saveComplaint()
      }, function (evt) {
        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total, 10)
        $scope.progress = '(Progress: ' + progressPercentage + '%)'
      }).catch(angular.noop)
    }
  }])
