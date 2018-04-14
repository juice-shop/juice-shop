angular.module('juiceShop').factory('UserService', ['$http', '$q', function ($http, $q) {
  'use strict'

  var host = '/api/Users'

  function find (params) {
    var users = $q.defer()
    $http.get('/rest/user/authentication-details/', {
      params: params
    }).then(function (response) {
      users.resolve(response.data.data)
    }).catch(function (response) {
      users.reject(response.data)
    })
    return users.promise
  }

  function get (id) {
    var user = $q.defer()
    $http.get(host + '/' + id).then(function (response) {
      user.resolve(response.data.data)
    }).catch(function (response) {
      user.reject(response.data)
    })
    return user.promise
  }

  function save (params) {
    var createdUser = $q.defer()
    $http.post(host + '/', params).then(function (response) {
      createdUser.resolve(response.data.data)
    }).catch(function (response) {
      createdUser.reject(response.data)
    })
    return createdUser.promise
  }

  function login (params) {
    var authentication = $q.defer()
    $http.post('/rest/user/login', params).then(function (response) {
      authentication.resolve(response.data.authentication)
    }).catch(function (response) {
      authentication.reject(response.data)
    })
    return authentication.promise
  }

  function changePassword (passwords) {
    var updatedUser = $q.defer()
    $http.get('/rest/user/change-password?current=' + passwords.current + '&new=' + passwords.new + '&repeat=' + passwords.repeat).then(function (response) {
      updatedUser.resolve(response.data.user)
    }).catch(function (response) {
      updatedUser.reject(response.data)
    })
    return updatedUser.promise
  }

  function resetPassword (params) {
    var updatedUser = $q.defer()
    $http.post('/rest/user/reset-password', params).then(function (response) {
      updatedUser.resolve(response.data.user)
    }).catch(function (response) {
      updatedUser.reject(response.data)
    })
    return updatedUser.promise
  }

  function whoAmI () {
    var currentUser = $q.defer()
    $http.get('/rest/user/whoami').then(function (response) {
      currentUser.resolve(response.data.user)
    }).catch(function (response) {
      currentUser.reject(response.data)
    })
    return currentUser.promise
  }

  function oauthLogin (accessToken) {
    var oauthResponse = $q.defer()
    $http.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + accessToken).then(function (response) {
      console.log('done: ' + response.data)
      oauthResponse.resolve(response.data)
    }).catch(function (response) {
      oauthResponse.reject(response.data)
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
