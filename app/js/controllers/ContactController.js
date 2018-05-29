angular.module('juiceShop').controller('ContactController', [
  '$scope',
  'FeedbackService',
  'UserService',
  'CaptchaService',
  function ($scope, feedbackService, userService, captchaService) {
    'use strict'

    userService.whoAmI().then(function (data) {
      $scope.feedback = {}
      $scope.feedback.UserId = data.id
      $scope.userEmail = data.email || 'anonymous'
    }).catch(angular.noop)

    function getNewCaptcha () {
      captchaService.getCaptcha().then(function (data) {
        $scope.captcha = data.captcha
        $scope.captchaId = data.captchaId
      }).catch(angular.noop)
    }
    getNewCaptcha()

    $scope.save = function () {
      $scope.feedback.captchaId = $scope.captchaId
      feedbackService.save($scope.feedback).then(function (savedFeedback) {
        $scope.error = null
        $scope.confirmation = 'Thank you for your feedback' + (savedFeedback.rating === 5 ? ' and your 5-star rating!' : '.')
        $scope.feedback = {}
        getNewCaptcha()
        $scope.form.$setPristine()
      }).catch(function (error) {
        $scope.error = error
        $scope.confirmation = null
        $scope.feedback = {}
        $scope.form.$setPristine()
      })
    }
  }])
