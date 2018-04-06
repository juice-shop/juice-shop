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

  $routeProvider.when('/forgot-password', {
    templateUrl: 'views/ForgotPassword.html',
    controller: 'ForgotPasswordController'
  })

  $routeProvider.when('/score-board', {
    templateUrl: 'views/ScoreBoard.html',
    controller: 'ChallengeController'
  })

  $routeProvider.when('/complain', {
    templateUrl: 'views/Complaint.html',
    controller: 'ComplaintController'
  })

  $routeProvider.when('/recycle', {
    templateUrl: 'views/Recycle.html',
    controller: 'RecycleController'
  })

  $routeProvider.when('/track-order', {
    templateUrl: 'views/TrackOrder.html',
    controller: 'TrackOrderController'
  })

  $routeProvider.when('/track-result', {
    templateUrl: 'views/TrackResult.html',
    controller: 'TrackResultController'
  })

  $routeProvider.when('/access_token=:accessToken', {
    templateUrl: 'views/OAuth.html',
    controller: 'OAuthController'
  })

  $routeProvider.when('/' + (function () {
    var L = Array.prototype.slice.call(arguments)
    var D = L.shift()
    return L.reverse().map(function (C, A) { return String.fromCharCode(C - D - 45 - A) }).join('')
  })(25, 184, 174, 179, 182, 186) + (36669).toString(36).toLowerCase() + (function () {
      var T = Array.prototype.slice.call(arguments)
      var M = T.shift()
      return T.reverse().map(function (m, H) { return String.fromCharCode(m - M - 24 - H) }).join('')
    })(13, 144, 87, 152, 139, 144, 83, 138) + (10).toString(36).toLowerCase(), {
    templateUrl: 'views/TokenSale.html',
    controller: 'TokenSaleController'
  })

  /* default route */
  $routeProvider.otherwise({redirectTo: '/search'})
}
])
