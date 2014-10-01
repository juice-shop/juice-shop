angular.module('myApp').factory('BasketService', ['$http', function ($http) {
    'use strict';

    var host = '/api/BasketItems';

    function get(id) {
        return $http.get('/rest/basket/' + id);
    }

    function del(id) {
        return $http.delete(host + '/' + id);
    }

    return {
        get: get,
        del: del
    };
}]);