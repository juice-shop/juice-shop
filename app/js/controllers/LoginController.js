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
      var oauthProviderUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
      var clientId = '1005568560502-6hm16lef8oh46hr2d98vf2ohlnj4nfhq.apps.googleusercontent.com'
      var redirectUri = $location.protocol() + '://' + location.host
      $window.location.replace(oauthProviderUrl + '?client_id=' + clientId + '&response_type=token&scope=email&redirect_uri=' + redirectUri)
    }
  }])
