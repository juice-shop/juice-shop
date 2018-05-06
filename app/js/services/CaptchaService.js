angular.module('juiceShop').factory('CaptchaService', ['$http', '$q', function ($http, $q) {
  'use strict'

  var host = '/rest/captcha'

  function getCaptcha () {
    var captchaString = $q.defer()
    $http.get(host + '/').then(function (response) {
      captchaString.resolve(response.data)
    }).catch(function (response) {
      captchaString.reject(response.data)
    })
    return captchaString.promise
  }

  return {
    getCaptcha: getCaptcha
  }
}])
