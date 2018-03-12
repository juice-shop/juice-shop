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
    })

    captchaService.getCaptcha().then(function (data) {
      $scope.captcha = data.captcha
      $scope.captchaId = data.captchaId
    })

    $scope.save = function () {
      $scope.feedback.captchaId = $scope.captchaId
      feedbackService.save($scope.feedback).then(function (savedFeedback) {
        $scope.error = null
        $scope.confirmation = 'Thank you for your feedback' + (savedFeedback.rating === 5 ? ' and your 5-star rating!' : '.')
        captchaService.getCaptcha().then(function (data) {
          $scope.captcha = data.captcha
          $scope.captchaId = data.captchaId
        })
        $scope.feedback = {}
        $scope.form.$setPristine()
      }).catch(function (error) {
        $scope.confirmation = null
        $scope.error = error
        $scope.feedback = {}
        $scope.form.$setPristine()
      })
    }
  }])
