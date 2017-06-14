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
      console.log(continueCode)
      if (continueCode) {
        challengeService.restoreProgress(encodeURIComponent(continueCode)).then(function () {
          $cookies.remove('continueCode')
          $translate('NOTIFICATION_SERVER_STARTED').then(function (notificationServerStarted) {
            $scope.serverStartedMessage = notificationServerStarted
          }, function (translationId) {
            $scope.serverStartedMessage = translationId
          })
        }).catch(function (error) {
          console.log(error)
        })
      }
    })
  } ])
