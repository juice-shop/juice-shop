angular.module('juiceShop').controller('BasketController', [
  '$scope',
  '$sce',
  '$window',
  '$translate',
  '$uibModal',
  'BasketService',
  'UserService',
  'ConfigurationService',
  function ($scope, $sce, $window, $translate, $uibModal, basketService, userService, configurationService) {
    'use strict'

    userService.whoAmI().then(function (data) {
      $scope.userEmail = data.email || 'anonymous'
    })

    $scope.couponPanelExpanded = $window.localStorage.couponPanelExpanded ? JSON.parse($window.localStorage.couponPanelExpanded) : false
    $scope.paymentPanelExpanded = $window.localStorage.paymentPanelExpanded ? JSON.parse($window.localStorage.paymentPanelExpanded) : false

    $scope.toggleCoupon = function () {
      $window.localStorage.couponPanelExpanded = JSON.stringify($scope.couponPanelExpanded)
    }

    $scope.togglePayment = function () {
      $window.localStorage.paymentPanelExpanded = JSON.stringify($scope.paymentPanelExpanded)
    }

    function load () {
      basketService.find($window.sessionStorage.bid).then(function (basket) {
        $scope.products = basket.Products
        for (var i = 0; i < $scope.products.length; i++) {
          $scope.products[i].description = $sce.trustAsHtml($scope.products[i].description)
        }
      }).catch(function (err) {
        console.log(err)
      })
    }
    load()

    $scope.delete = function (id) {
      basketService.del(id).then(function () {
        load()
      }).catch(function (err) {
        console.log(err)
      })
    }

    $scope.applyCoupon = function () {
      basketService.applyCoupon($window.sessionStorage.bid, encodeURIComponent($scope.coupon)).then(function (data) {
        $scope.coupon = undefined
        $translate('DISCOUNT_APPLIED', {discount: data}).then(function (discountApplied) {
          $scope.confirmation = discountApplied
        }, function (translationId) {
          $scope.confirmation = translationId
        })
        $scope.error = undefined
        $scope.form.$setPristine()
      }).catch(function (error) {
        console.log(error)
        $scope.confirmation = undefined
        $scope.error = error
        $scope.form.$setPristine()
      })
    }

    $scope.checkout = function () {
      basketService.checkout($window.sessionStorage.bid).then(function (orderConfirmationPath) {
        $window.location.replace(orderConfirmationPath)
      }).catch(function (err) {
        console.log(err)
      })
    }

    $scope.inc = function (id) {
      addToQuantity(id, 1)
    }

    $scope.dec = function (id) {
      addToQuantity(id, -1)
    }

    function addToQuantity (id, value) {
      basketService.get(id).then(function (basketItem) {
        var newQuantity = basketItem.quantity + value
        basketService.put(id, {quantity: newQuantity < 1 ? 1 : newQuantity}).then(function () {
          load()
        }).catch(function (err) {
          console.log(err)
        })
      }).catch(function (err) {
        console.log(err)
      })
    }

    $scope.showBitcoinQrCode = function () {
      $uibModal.open({
        templateUrl: 'views/QrCode.html',
        controller: 'QrCodeController',
        size: 'md',
        resolve: {
          data: function () { return 'bitcoin:1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm' },
          url: function () { return '/redirect?to=https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm' },
          address: function () { return '1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm' },
          title: function () { return 'TITLE_BITCOIN_ADDRESS' }
        }
      })
    }

    $scope.showDashQrCode = function () {
      $uibModal.open({
        templateUrl: 'views/QrCode.html',
        controller: 'QrCodeController',
        size: 'md',
        resolve: {
          data: function () { return 'dash:Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW' },
          url: function () { return '/redirect?to=https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW' },
          address: function () { return 'Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW' },
          title: function () { return 'TITLE_DASH_ADDRESS' }
        }
      })
    }

    $scope.showEtherQrCode = function () {
      $uibModal.open({
        templateUrl: 'views/QrCode.html',
        controller: 'QrCodeController',
        size: 'md',
        resolve: {
          data: function () { return '0x0f933ab9fCAAA782D0279C300D73750e1311EAE6' },
          url: function () { return 'https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6' },
          address: function () { return '0x0f933ab9fCAAA782D0279C300D73750e1311EAE6' },
          title: function () { return 'TITLE_ETHER_ADDRESS' }
        }
      })
    }

    $scope.twitterUrl = null
    $scope.facebookUrl = null
    $scope.applicationName = 'OWASP Juice Shop'
    configurationService.getApplicationConfiguration().then(function (config) {
      if (config && config.application) {
        if (config.application.twitterUrl !== null) {
          $scope.twitterUrl = config.application.twitterUrl
        }
        if (config.application.facebookUrl !== null) {
          $scope.facebookUrl = config.application.facebookUrl
        }
        if (config.application.name !== null) {
          $scope.applicationName = config.application.name
        }
      }
    }).catch(function (err) {
      console.log(err)
    })
  }])
