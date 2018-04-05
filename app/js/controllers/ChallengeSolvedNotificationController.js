angular.module('juiceShop').controller('ChallengeSolvedNotificationController', [
  '$scope',
  '$rootScope',
  '$translate',
  '$cookies',
  'socket',
  'ConfigurationService',
  'ChallengeService',
  function ($scope, $rootScope, $translate, $cookies, socket, configurationService, challengeService) {
    'use strict'

    $scope.notifications = []

    $scope.closeNotification = function (index) {
      $scope.notifications.splice(index, 1)
    }

    $scope.showNotification = function (challenge) {
      $translate('CHALLENGE_SOLVED', { challenge: challenge.challenge })
        .then(function (challengeSolved) {
          return challengeSolved
        }, function (translationId) {
          return translationId
        }).catch(angular.noop)
        .then(function (message) {
          $scope.notifications.push({
            message: message,
            flag: challenge.flag,
            copied: false
          })
        }).catch(angular.noop)
    }

    $scope.saveProgress = function () {
      challengeService.continueCode().then(function (continueCode) {
        if (!continueCode) {
          throw (new Error('Received invalid continue code from the sever!'))
        }

        var expireDate = new Date()
        expireDate.setDate(expireDate.getDate() + 30)
        $cookies.put('continueCode', continueCode, { expires: expireDate })
      }).catch(function (err) {
        console.log(err)
      })
    }

    socket.on('challenge solved', function (data) {
      if (data && data.challenge) {
        if (!data.hidden) {
          $scope.showNotification(data)
        }
        if (!data.isRestore) {
          $scope.saveProgress()
        }
        if (data.name === 'Score Board') {
          $rootScope.$emit('score_board_challenge_solved')
        }
        socket.emit('notification received', data.flag)
      }
    })
    configurationService.getApplicationConfiguration().then(function (config) {
      if (config && config.application && config.application.showCtfFlagsInNotifications !== null) {
        $scope.showCtfFlagsInNotifications = config.application.showCtfFlagsInNotifications
      } else {
        $scope.showCtfFlagsInNotifications = false
      }
    }, function (err) {
      console.log(err)
    }).catch(angular.noop)
  } ])
