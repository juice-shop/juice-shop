// This service is used in the fbctf integration to resolve the country mapping file.
angular.module('juiceShop').factory('CountryMappingService', ['$http', '$q', function ($http, $q) {
  'use strict'

  function getCountryMapping () {
    var countryMapping = $q.defer()
    $http.get('/rest/country-mapping').then(function (response) {
      countryMapping.resolve(response.data)
    }).catch(function (response) {
      countryMapping.reject(response.data)
    })
    return countryMapping.promise
  }

  return {
    getCountryMapping: getCountryMapping
  }
}])
