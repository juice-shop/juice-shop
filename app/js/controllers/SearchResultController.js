angular.module('juiceShop').controller('SearchResultController', [
  '$scope',
  '$sce',
  '$window',
  '$uibModal',
  '$location',
  '$translate',
  'ProductService',
  'BasketService',
  function ($scope, $sce, $window, $uibModal, $location, $translate, productService, basketService) {
    'use strict'

    $scope.showDetail = function (id) {
      $uibModal.open({
        templateUrl: 'views/ProductDetail.html',
        controller: 'ProductDetailsController',
        size: 'lg',
        resolve: {
          id: function () {
            return id
          }
        }
      })
    }

    $scope.addToBasket = function (id) {
      basketService.find($window.sessionStorage.bid).then(function (basket) {
        var productsInBasket = basket.Products
        var found = false
        for (var i = 0; i < productsInBasket.length; i++) {
          if (productsInBasket[i].id === id) {
            found = true
            basketService.get(productsInBasket[i].BasketItem.id).then(function (existingBasketItem) {
              var newQuantity = existingBasketItem.quantity + 1
              basketService.put(existingBasketItem.id, { quantity: newQuantity }).then(function (updatedBasketItem) {
                productService.get(updatedBasketItem.ProductId).then(function (product) {
                  $translate('BASKET_ADD_SAME_PRODUCT', { product: product.name }).then(function (basketAddSameProduct) {
                    $scope.confirmation = basketAddSameProduct
                  }, function (translationId) {
                    $scope.confirmation = translationId
                  }).catch(angular.noop)
                }).catch(function (err) {
                  console.log(err)
                })
              }).catch(function (err) {
                console.log(err)
              })
            }).catch(function (err) {
              console.log(err)
            })
            break
          }
        }
        if (!found) {
          basketService.save({ ProductId: id, BasketId: $window.sessionStorage.bid, quantity: 1 }).then(function (newBasketItem) {
            productService.get(newBasketItem.ProductId).then(function (product) {
              $translate('BASKET_ADD_PRODUCT', { product: product.name }).then(function (basketAddProduct) {
                $scope.confirmation = basketAddProduct
              }, function (translationId) {
                $scope.confirmation = translationId
              }).catch(angular.noop)
            }).catch(function (err) {
              console.log(err)
            })
          }).catch(function (err) {
            console.log(err)
          })
        }
      }).catch(function (err) {
        console.log(err)
      })
    }

    $scope.searchQuery = $sce.trustAsHtml($location.search().q)

    productService.search($scope.searchQuery).then(function (products) {
      $scope.products = products
      for (var i = 0; i < $scope.products.length; i++) {
        $scope.products[i].description = $sce.trustAsHtml($scope.products[i].description) // lgtm [js/xss]
      }
    }).catch(function (err) {
      console.log(err)
    })
  }])
