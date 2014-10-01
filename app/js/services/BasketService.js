angular.module('myApp').factory('BasketService', ['$http', function ($http) {
    'use strict';

    function get(id) {
        return $http.get('/rest/basket/' + id);
    }

    return {
        get: get
    };
}]);