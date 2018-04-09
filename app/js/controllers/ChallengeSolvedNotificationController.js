angular.module('juiceShop').controller('ChallengeSolvedNotificationController', [
  '$scope',
  '$rootScope',
  '$translate',
  '$cookies',
  'socket',
  'ConfigurationService',
  'ChallengeService',
  'CountryMappingService',
  function ($scope, $rootScope, $translate, $cookies, socket, configurationService, challengeService, countryMappingService) {
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
        }).then(function (message) {
          var country = $scope.showCtfCountryDetailsInNotifications ? $scope.countryMap[challenge.id.toString()].country : null
          $scope.notifications.push({
            message: message,
            flag: challenge.flag,
            country: country,
            copied: false
          })
        })
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
      if (config && config.application) {
        if (config.application.showCtfFlagsInNotifications !== null) {
          $scope.showCtfFlagsInNotifications = config.application.showCtfFlagsInNotifications
        } else {
          $scope.showCtfFlagsInNotifications = false
        }

        if (config.application.showCtfCountryDetailsInNotifications !== null) {
          $scope.showCtfCountryDetailsInNotifications = config.application.showCtfCountryDetailsInNotifications

          if (config.application.showCtfCountryDetailsInNotifications) {
            countryMappingService.getCountryMapping().then(function (countryMap) {
              $scope.countryMap = countryMap
            }).catch(function (err) {
              console.log(err)
            })
          }
        } else {
          $scope.showCtfCountryDetailsInNotifications = false
        }
      }
    }, function (err) {
      console.log(err)
    })
  } ])
