angular.module('myApp').config(['$routeProvider', function ($routeProvider) {
    'use strict';

    $routeProvider.when('/best-deals', {
        templateUrl: 'views/BestDeals.html',
        controller: 'ProductController'
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
        controller: 'FeedbackController'
    });

    /* default route */
    $routeProvider.otherwise({redirectTo: '/best-deals'});
}]);
