angular.module('myApp').factory('UserService', ['$http', function ($http) {
    'use strict';

    var host = '/api/Users';

    function find(params) {
        return $http.get(host + '/', {
            params: params
        });
    }

    function get(id) {
        return $http.get(host + '/' + id);
    }

    function del(id) {
        return $http.delete(host + '/' + id);
    }

    return {
        find: find,
        get: get,
        del: del
    };
}]);