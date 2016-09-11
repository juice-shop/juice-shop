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
  }])
