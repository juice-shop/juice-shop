angular.module('juiceShop').factory('UserService', ['$http', '$q', function ($http, $q) {
  'use strict'

  var host = '/api/Users'

  function find (params) {
    var users = $q.defer()
    $http.get('/rest/user/authentication-details/', {params: params}).success(function (data) {
      users.resolve(data.data)
    }).error(function (err) {
      users.reject(err)
    })
    return users.promise
  }

  function get (id) {
    var user = $q.defer()
    $http.get(host + '/' + id).success(function (data) {
      user.resolve(data.data)
    }).error(function (err) {
      user.reject(err)
    })
    return user.promise
  }

  function save (params) {
    var createdUser = $q.defer()
    $http.post(host + '/', params).success(function (data) {
      createdUser.resolve(data.data)
    }).error(function (err) {
      createdUser.reject(err)
    })
    return createdUser.promise
  }

  function login (params) {
    var authentication = $q.defer()
    $http.post('/rest/user/login', params).success(function (data) {
      authentication.resolve(data.authentication)
    }).error(function (err) {
      authentication.reject(err)
    })
    return authentication.promise
  }

  function changePassword (passwords) {
    var updatedUser = $q.defer()
    $http.get('/rest/user/change-password?current=' + passwords.current + '&new=' + passwords.new + '&repeat=' + passwords.repeat).success(function (data) {
      updatedUser.resolve(data.user)
    }).error(function (err) {
      updatedUser.reject(err)
    })
    return updatedUser.promise
  }

  function resetPassword (params) {
    var updatedUser = $q.defer()
    $http.post('/rest/user/reset-password', params).success(function (data) {
      updatedUser.resolve(data.user)
    }).error(function (err) {
      updatedUser.reject(err)
    })
    return updatedUser.promise
  }
  function whoAmI () {
    var currentUser = $q.defer()
    $http.get('/rest/user/whoami').success(function (data) {
      currentUser.resolve(data.user)
    }).error(function (err) {
      currentUser.reject(err)
    })
    return currentUser.promise
  }

  function oauthLogin (accessToken) {
    var oauthResponse = $q.defer()
    $http.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + accessToken).success(function (data) {
      console.log('done: ' + data)
      oauthResponse.resolve(data)
    }).error(function (err) {
      oauthResponse.reject(err)
    })
    return oauthResponse.promise
  }

  return {
    find: find,
    get: get,
    save: save,
    login: login,
    changePassword: changePassword,
    resetPassword: resetPassword,
    whoAmI: whoAmI,
    oauthLogin: oauthLogin
  }
}])
