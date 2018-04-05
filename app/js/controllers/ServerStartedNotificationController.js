angular.module('juiceShop').controller('ServerStartedNotificationController', [
  '$scope',
  '$translate',
  '$cookies',
  'ChallengeService',
  'socket',
  function ($scope, $translate, $cookies, challengeService, socket) {
    'use strict'

    $scope.hackingProgress = { }

    $scope.closeNotification = function () {
      $scope.hackingProgress.autoRestoreMessage = null
    }

    $scope.clearProgress = function () {
      $cookies.remove('continueCode')
      $scope.hackingProgress.cleared = true
    }

    socket.on('server started', function () {
      var continueCode = $cookies.get('continueCode')
      if (continueCode) {
        challengeService.restoreProgress(encodeURIComponent(continueCode)).then(function () {
          $translate('AUTO_RESTORED_PROGRESS').then(function (notificationServerStarted) {
            $scope.hackingProgress.autoRestoreMessage = notificationServerStarted
          }, function (translationId) {
            $scope.hackingProgress.autoRestoreMessage = translationId
          }).catch(angular.noop)
        }).catch(function (error) {
          console.log(error)
          $translate('AUTO_RESTORE_PROGRESS_FAILED', { error: error }).then(function (notificationServerStarted) {
            $scope.hackingProgress.autoRestoreMessage = notificationServerStarted
          }, function (translationId) {
            $scope.hackingProgress.autoRestoreMessage = translationId
          }).catch(angular.noop)
        })
      }
    })
  } ])
