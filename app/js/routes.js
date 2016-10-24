angular.module('juiceShop').config(['$routeProvider', function ($routeProvider) {
  'use strict'

  $routeProvider.when('/administration', {
    templateUrl: 'views/Administration.html',
    controller: 'AdministrationController'
  })

  $routeProvider.when('/about', {
    templateUrl: 'views/About.html',
    controller: 'AboutController'
  })

  $routeProvider.when('/contact', {
    templateUrl: 'views/Contact.html',
    controller: 'ContactController'
  })

  $routeProvider.when('/login', {
    templateUrl: 'views/Login.html',
    controller: 'LoginController'
  })

  $routeProvider.when('/register', {
    templateUrl: 'views/Register.html',
    controller: 'RegisterController'
  })

  $routeProvider.when('/basket', {
    templateUrl: 'views/Basket.html',
    controller: 'BasketController'
  })

  $routeProvider.when('/search', {
    templateUrl: 'views/SearchResult.html',
    controller: 'SearchResultController'
  })

  $routeProvider.when('/logout', {
    templateUrl: 'views/Logout.html',
    controller: 'LogoutController'
  })

  $routeProvider.when('/change-password', {
    templateUrl: 'views/ChangePassword.html',
    controller: 'ChangePasswordController'
  })

  $routeProvider.when('/score-board', {
    templateUrl: 'views/ScoreBoard.html',
    controller: 'ChallengeController'
  })

  $routeProvider.when('/complain', {
    templateUrl: 'views/Complaint.html',
    controller: 'ComplaintController'
  })

  $routeProvider.when('/access_token=:accessToken', {
    templateUrl: 'views/OAuth.html',
    controller: 'OAuthController'
  })

    /* default route */
  $routeProvider.otherwise({redirectTo: '/search'})
}])
