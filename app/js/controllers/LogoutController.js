angular.module('myApp').controller('LogoutController', [
    '$cookieStore',
    '$window',
    '$location',
    function ($cookieStore, $window, $location) {
        'use strict';

        $cookieStore.remove('token');
        delete $window.sessionStorage.bid;
        $location.path('/');

    }]);