angular.module('juiceShop').controller('ChallengeSolvedNotificationController', [
  '$scope',
  '$translate',
  'socket',
  'ConfigurationService',
  function ($scope, $translate, socket, configurationService) {
    'use strict'

    $scope.notifications = []

    $scope.closeNotification = function (index) {
      $scope.notifications.splice(index, 1)
    }

    socket.on('challenge solved', function (data) {
      if (data && data.challenge && !data.hidden) {
        $translate('CHALLENGE_SOLVED', { challenge: data.challenge }).then(function (challengeSolved) {
          $scope.notifications.push({
            message: challengeSolved,
            flag: data.flag,
            copied: false
          })
        }, function (translationId) {
          $scope.notifications.push({
            message: translationId,
            flag: data.flag,
            copied: false
          })
        })
        socket.emit('notification received', data.flag)
      }
    })
    configurationService.getApplicationConfiguration().then(function (data) {
      if (data && data.application && data.application.ctfEnabled !== null) {
        $scope.ctfEnabled = data.application.ctfEnabled
      } else {
        $scope.ctfEnabled = false
      }
    }, function (err) {
      console.log(err)
    })
  } ])
