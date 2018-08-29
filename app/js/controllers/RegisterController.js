angular.module('juiceShop').controller('RegisterController', [
  '$scope',
  '$location',
  'UserService',
  'SecurityQuestionService',
  'SecurityAnswerService',
  function ($scope, $location, userService, securityQuestionService, securityAnswerService) {
    'use strict'

    securityQuestionService.find().then(function (securityQuestions) {
      $scope.securityQuestions = securityQuestions
    }).catch(function (err) {
      console.log(err)
    })

    $scope.save = function () {
      userService.save($scope.user).then(function (user) {
        securityAnswerService.save({ UserId: user.id, answer: $scope.user.securityAnswer, SecurityQuestionId: $scope.user.securityQuestion.id }).then(function () {
          $scope.user = {}
          $location.path('/login')
        })
      }).catch(angular.noop)
    }
  }])
