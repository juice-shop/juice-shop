angular.module('juiceShop').controller('LogoutController', [
  '$cookies',
  '$window',
  '$location',
  function ($cookies, $window, $location) {
    'use strict'

    $cookies.remove('token')
    delete $window.sessionStorage.bid
    $location.path('/')
  }])
