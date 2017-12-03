angular.module('juiceShop').controller('LogoutController', [
  '$rootScope',
  '$cookies',
  '$window',
  '$location',
  function ($rootScope, $cookies, $window, $location) {
    'use strict'

    $cookies.remove('token')
    delete $window.sessionStorage.bid
    $rootScope.$emit('user_logged_out')
    $location.path('/')
  }])
