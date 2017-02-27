angular.module('juiceShop').controller('BasketController', [
  '$scope',
  '$sce',
  '$window',
  '$translate',
  '$uibModal',
  'BasketService',
  function ($scope, $sce, $window, $translate, $uibModal, basketService) {
    'use strict'

    $scope.couponCollapsed = true
    $scope.paymentCollapsed = true

    function load () {
      basketService.find($window.sessionStorage.bid).success(function (basket) {
        $scope.products = basket.data.products
        for (var i = 0; i < $scope.products.length; i++) {
          $scope.products[i].description = $sce.trustAsHtml($scope.products[i].description)
        }
      }).error(function (err) {
        console.log(err)
      })
    }
    load()

    $scope.delete = function (id) {
      basketService.del(id).success(function () {
        load()
      }).error(function (err) {
        console.log(err)
      })
    }

    $scope.applyCoupon = function () {
      basketService.applyCoupon($window.sessionStorage.bid, encodeURIComponent($scope.coupon)).success(function (data) {
        $scope.coupon = undefined
        $translate('DISCOUNT_APPLIED', {discount: data.discount}).then(function (discountApplied) {
          $scope.confirmation = discountApplied
        }, function (translationId) {
          $scope.confirmation = translationId
        })
        $scope.error = undefined
        $scope.form.$setPristine()
      }).error(function (error) {
        console.log(error)
        $scope.confirmation = undefined
        $scope.error = error // Intentionally not translated to indicate that the error just passed through from backend
        $scope.form.$setPristine()
      })
    }

    $scope.checkout = function () {
      basketService.checkout($window.sessionStorage.bid).success(function (confirmationUrl) {
        $window.location.replace(confirmationUrl)
      }).error(function (err) {
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
      basketService.get(id).success(function (basket) {
        var newQuantity = basket.data.quantity + value
        basketService.put(id, {quantity: newQuantity < 1 ? 1 : newQuantity}).success(function () {
          load()
        }).error(function (err) {
          console.log(err)
        })
      }).error(function (err) {
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
  }])
