angular.module('juiceShop').controller('OAuthController', [
  '$rootScope',
  '$window',
  '$location',
  '$cookies',
  '$base64',
  'UserService',
  function ($rootScope, $window, $location, $cookies, $base64, userService) {
    'use strict'

    userService.oauthLogin(parseRedirectUrlParams()['access_token']).then(function (profile) {
      userService.save({ email: profile.email, password: $base64.encode(profile.email) }).then(function () {
        login(profile)
      }).catch(function () { // eslint-disable-line handle-callback-err
        login(profile)
      })
    }).catch(function (error) {
      invalidateSession(error)
      $location.path('/login')
    })

    function login (profile) {
      userService.login({ email: profile.email, password: $base64.encode(profile.email), oauth: true }).then(function (authentication) {
        $cookies.put('token', authentication.token)
        $window.sessionStorage.bid = authentication.bid
        $rootScope.$emit('user_logged_in')
        $location.path('/')
      }).catch(function (error) {
        invalidateSession(error)
        $location.path('/login')
      })
    }

    function invalidateSession (error) {
      console.log(error)
      $cookies.remove('token')
      delete $window.sessionStorage.bid
    }

    /**
     * Only the 'access_token' parameter is needed. This function only extracts all parameters to have some realistic
     * parsing logic in the minified JavaScript. This "noise code" is supposed to make analyzing the mechanism harder
     * for the attacker.
     */
    function parseRedirectUrlParams () {
      var hash = $location.path().substr(1)
      var splitted = hash.split('&')
      var params = {}
      for (var i = 0; i < splitted.length; i++) {
        var param = splitted[ i ].split('=')
        var key = param[ 0 ]
        params[ key ] = param[ 1 ]
      }
      return params
    }
  }])
