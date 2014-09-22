angular.module('myApp').factory('FeedbackService', ['$http', function ($http) {
    'use strict';

    var host = '/api/Feedbacks';

    function find(params) {
        return $http.get(host + '/', {
            params: params
        });
    }

    function del(id) {
        return $http.delete(host + '/' + id);
    }

    return {
        find: find,
        del: del
    };
}]);