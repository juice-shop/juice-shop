angular.module('juiceShop').controller('ContactController', [
  '$scope',
  'FeedbackService',
  'UserService',
  function ($scope, feedbackService, userService) {
    'use strict'

    userService.whoAmI().then(function (data) {
      $scope.feedback = {}
      $scope.feedback.UserId = data.id
      $scope.userEmail = data.email || 'anonymous'
    })

    $scope.save = function () {
      feedbackService.save($scope.feedback).then(function (savedFeedback) {
        $scope.confirmation = 'Thank you for your feedback' + (savedFeedback.rating === 5 ? ' and your 5-star rating!' : '.')
        $scope.feedback = {}
        $scope.form.$setPristine()
      })
    }
  }])
