angular.module('juiceShop').controller('ChallengeSolvedNotificationController', [
  '$scope',
  '$translate',
  'socket',
  function ($scope, $translate, socket) {
    'use strict'

    $scope.notifications = []

    $scope.closeNotification = function (index) {
      $scope.notifications.splice(index, 1)
    }

    socket.on('challenge solved', function (data) {
      if (data && data.challenge) {
        $translate('CHALLENGE_SOLVED', { challenge: data.challenge }).then(function (challengeSolved) {
          $scope.notifications.push({message: challengeSolved})
        }, function (translationId) {
          $scope.notifications.push({message: translationId})
        })
        socket.emit('notification received', data.challenge)
      }
    })
  } ])
