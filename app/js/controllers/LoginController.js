angular.module('juiceShop').controller('LoginController', [
  '$scope',
  '$rootScope',
  '$window',
  '$location',
  '$cookies',
  'UserService',
  function ($scope, $rootScope, $window, $location, $cookies, userService) {
    'use strict'

    var email = $cookies.get('email')
    if (email) {
      $scope.user = {}
      $scope.user.email = email
      $scope.rememberMe = true
    } else {
      $scope.rememberMe = false
    }

    $scope.login = function () {
      userService.login($scope.user).then(function (authentication) {
        $cookies.put('token', authentication.token)
        $window.sessionStorage.bid = authentication.bid
        $rootScope.$emit('user_logged_in')
        $location.path('/')
      }).catch(function (error) {
        $cookies.remove('token')
        delete $window.sessionStorage.bid
        $scope.error = error
        $scope.form.$setPristine()
      })
      if ($scope.rememberMe) {
        $cookies.put('email', $scope.user.email)
      } else {
        $cookies.remove('email')
      }
    }

    $scope.googleLogin = function () {
      $window.location.replace(oauthProviderUrl + '?client_id=' + clientId + '&response_type=token&scope=email&redirect_uri=' + authorizedRedirectURIs[redirectUri])
    }

    var oauthProviderUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
    var clientId = '1005568560502-6hm16lef8oh46hr2d98vf2ohlnj4nfhq.apps.googleusercontent.com'

    var authorizedRedirectURIs = {
      'http://demo.owasp-juice.shop': 'http://demo.owasp-juice.shop',
      'https://juice-shop.herokuapp.com': 'https://juice-shop.herokuapp.com',
      'http://juice-shop.herokuapp.com': 'http://juice-shop.herokuapp.com',
      'http://preview.owasp-juice.shop': 'http://preview.owasp-juice.shop',
      'https://juice-shop-staging.herokuapp.com': 'https://juice-shop-staging.herokuapp.com',
      'http://juice-shop-staging.herokuapp.com': 'http://juice-shop-staging.herokuapp.com',
      'http://localhost:3000': 'http://localhost:3000',
      'http://localhost:4200': 'http://localhost:4200',
      'http://juice.sh': 'http://juice.sh',
      'http://192.168.99.100:3000': 'http://tinyurl.com/ipMacLocalhost'
    }
    var redirectUri = $location.protocol() + '://' + location.host
    $scope.oauthUnavailable = !authorizedRedirectURIs[redirectUri]
    if ($scope.oauthUnavailable) {
      console.log(redirectUri + ' is not an authorized redirect URI for this application.')
    }
  }])
