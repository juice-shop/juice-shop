angular.module('juiceShop').controller('OAuthController', [
  '$window',
  '$location',
  '$cookieStore',
  'UserService',
  function ($window, $location, $cookieStore, userService) {
    'use strict'

    function login (profile) {
      userService.login({ email: profile.email, password: profile.email }).success(function (authentication) {
        $cookieStore.put('token', authentication.token)
        $window.sessionStorage.bid = authentication.bid
        $location.path('/')
      }).error(function (error) {
        $cookieStore.remove('token')
        delete $window.sessionStorage.bid
        console.log(error)
        $location.path('/login')
      })
    }

    var hash = $location.path().substr(1)
    var splitted = hash.split('&')
    var params = {}

    for (var i = 0; i < splitted.length; i++) {
      var param = splitted[i].split('=')
      var key = param[0]
      var value = param[1]
      params[key] = value
    }

    userService.oauthLogin(params.access_token).success(function (profile) {
      userService.save({email: profile.email, password: profile.email}).success(function () {
        login(profile)
      }).error(function (error) {
        console.log(error) // user probably exists already, so just try to log in
        login(profile)
      })
    }).error(function (error) {
      console.log(error)
      $location.path('/login')
    })
  }])
