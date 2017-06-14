angular.module('juiceShop').controller('ServerStartedNotificationController', [
  '$scope',
  '$translate',
  '$cookies',
  'ChallengeService',
  'socket',
  function ($scope, $translate, $cookies, challengeService, socket) {
    'use strict'

    $scope.closeNotification = function () {
      $scope.serverStartedMessage = null
    }

    socket.on('server started', function () {
      var continueCode = $cookies.get('continueCode')
      if (continueCode) {
        challengeService.restoreProgress(encodeURIComponent(continueCode)).then(function () {
          $cookies.remove('continueCode')
          $translate('AUTO_RESTORED_PROGRESS').then(function (notificationServerStarted) {
            $scope.serverStartedMessage = notificationServerStarted
          }, function (translationId) {
            $scope.serverStartedMessage = translationId
          })
        }).catch(function (error) {
          console.log(error)
          $translate('AUTO_RESTORE_PROGRESS_FAILED', { error: error }).then(function (notificationServerStarted) {
            $scope.serverStartedMessage = notificationServerStarted
          }, function (translationId) {
            $scope.serverStartedMessage = translationId
          })
        })
      }
    })
  } ])
