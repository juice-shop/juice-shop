angular.module('juiceShop').controller('RecycleController', [
  '$scope',
  'RecycleService',
  'UserService',
  'ConfigurationService',
  function ($scope, recycleService, userService, configurationService) {
    'use strict'

    configurationService.getApplicationConfiguration().then(function (config) {
      if (config && config.application && config.application.recyclePage) {
        $scope.topImage = '/public/images/products/' + config.application.recyclePage.topProductImage
        $scope.bottomImage = '/public/images/products/' + config.application.recyclePage.bottomProductImage
      }
    }).catch(angular.noop)

    function initRecycle () {
      userService.whoAmI().then(function (data) {
        $scope.recycle = {}
        $scope.recycle.UserId = data.id
        $scope.userEmail = data.email
      }).catch(angular.noop)
    }
    initRecycle()

    $scope.save = function () {
      recycleService.save($scope.recycle).then(function (savedRecycle) {
        $scope.confirmation = 'Thank you for using our recycling service. We will ' + (savedRecycle.isPickup ? ('pick up your pomace on ' + savedRecycle.pickupDate) : 'deliver your recycle box asap') + '.'
        initRecycle()
        $scope.form.$setPristine()
      })
    }

    function findAll () {
      recycleService.find().then(function (recycles) {
        $scope.recycles = recycles
      }).catch(function (err) {
        console.log(err)
      })
    }
    findAll()
  }])
