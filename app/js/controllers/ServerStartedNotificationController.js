angular.module('juiceShop').controller('ServerStartedNotificationController', [
  '$scope',
  '$translate',
  '$cookies',
  'ChallengeService',
  'socket',
  function ($scope, $translate, $cookies, challengeService, socket) {
    'use strict'

    $scope.closeNotification = function () {
      $scope.autoRestoreMessage = null
    }

    socket.on('server started', function () {
      var continueCode = $cookies.get('continueCode')
      if (continueCode) {
        challengeService.restoreProgress(encodeURIComponent(continueCode)).then(function () {
          $translate('AUTO_RESTORED_PROGRESS').then(function (notificationServerStarted) {
            $scope.autoRestoreMessage = notificationServerStarted
          }, function (translationId) {
            $scope.autoRestoreMessage = translationId
          })
        }).catch(function (error) {
          console.log(error)
          $translate('AUTO_RESTORE_PROGRESS_FAILED', { error: error }).then(function (notificationServerStarted) {
            $scope.autoRestoreMessage = notificationServerStarted
          }, function (translationId) {
            $scope.autoRestoreMessage = translationId
          })
        })
      }
    })
  } ])
