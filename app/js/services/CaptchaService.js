angular.module('juiceShop').factory('CaptchaService', ['$http', '$q', function ($http, $q) {
  'use strict'

  var host = '/rest/captcha'

  function getCaptcha () {
    var captchaString = $q.defer()
    $http.get(host + '/').success(function (data) {
      captchaString.resolve(data)
    }).error(function (err) {
      captchaString.reject(err)
    })
    return captchaString.promise
  }

  return {
    getCaptcha: getCaptcha
  }
}])
