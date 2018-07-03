angular.module('juiceShop').controller('LogoutController', [
  '$rootScope',
  '$cookies',
  '$window',
  '$location',
  'LogoutService',
  function ($rootScope, $cookies, $window, $location, logoutService) {
    'use strict'

    logoutService.save().then(function (results) {
      $cookies.remove('token')
      delete $window.sessionStorage.bid
      $rootScope.$emit('user_logged_out')
      $location.path('/')
    }).catch(angular.noop)
  }])
