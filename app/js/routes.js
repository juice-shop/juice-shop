angular.module('myApp').config(['$routeProvider', function ($routeProvider) {

    $routeProvider.when('/best-deals', {
        templateUrl: 'views/BestDeals.html',
        controller: 'ProductController'
    });

    $routeProvider.when('/administration', {
        templateUrl: 'views/Administration.html',
        controller: 'AdministrationController'
    });


    /* default route */
    $routeProvider.otherwise({redirectTo: '/best-deals'});
}]);
