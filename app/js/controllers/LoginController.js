angular.module('juiceShop').controller('LoginController', [
  '$scope',
  '$window',
  '$location',
  '$cookieStore',
  'UserService',
  function ($scope, $window, $location, $cookieStore, userService) {
    'use strict'

    $scope.login = function () {
      userService.login($scope.user).success(function (authentication) {
        $cookieStore.put('token', authentication.token)
        $window.sessionStorage.bid = authentication.bid
        $location.path('/')
      }).error(function (error) {
        $cookieStore.remove('token')
        delete $window.sessionStorage.bid
        $scope.error = error
        $scope.form.$setPristine()
      })
    }

    $scope.googleLogin = function () {
      $window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=1005568560502-6hm16lef8oh46hr2d98vf2ohlnj4nfhq.apps.googleusercontent.com&response_type=token&scope=email&redirect_uri=http://localhost:3000/'
    }
  }])
