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
          $scope.notifications.push({message: challengeSolved, flag: data.flag})
        }, function (translationId) {
          $scope.notifications.push({message: translationId, flag: data.flag})
        })
        socket.emit('notification received', data.flag)
      }
    })
  } ])
