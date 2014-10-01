angular.module('myApp').controller('LogoutController', [
    '$window',
    '$location',
    function ($window, $location) {
        'use strict';

        delete $window.sessionStorage.token;
        delete $window.sessionStorage.bid;
        $location.path( '/' );

    }]);