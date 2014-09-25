angular.module('myApp').config(['$routeProvider', function ($routeProvider) {
    'use strict';

    $routeProvider.when('/best-deals', {
        templateUrl: 'views/BestDeals.html',
        controller: 'BestDealsController'
    });

    $routeProvider.when('/administration', {
        templateUrl: 'views/Administration.html',
        controller: 'AdministrationController'
    });

    $routeProvider.when('/about', {
        templateUrl: 'views/About.html',
        controller: 'AboutController'
    });

    $routeProvider.when('/contact', {
        templateUrl: 'views/Contact.html',
        controller: 'ContactController'
    });

    $routeProvider.when('/login', {
        templateUrl: 'views/Login.html',
        controller: 'LoginController'
    });

    $routeProvider.when('/register', {
        templateUrl: 'views/Register.html',
        controller: 'RegisterController'
    });

    $routeProvider.when('/basket', {
        templateUrl: 'views/Basket.html',
        controller: 'BasketController'
    });

    $routeProvider.when('/search', {
        templateUrl: 'views/SearchResult.html',
        controller: 'SearchResultController'
    });

    /* default route */
    $routeProvider.otherwise({redirectTo: '/best-deals'});
}]);
