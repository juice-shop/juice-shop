angular.module('juiceShop').controller('ProductCommentEditController', [
  '$scope',
  '$uibModalInstance',
  'ProductReviewService',
  'comment',
  function ($scope, $uibModalInstance, productReviewService, comment) {
    'use strict'

    $scope.id = comment._id
    $scope.message = comment.message

    $scope.editComment = function () {
      productReviewService.patch({id: $scope.id, message: $scope.message}).success(function (result) {
        $uibModalInstance.close($scope.message)
      }).error(function (err) {
        console.log(err)
        $scope.err = err
      })
    }
  }])
