angular.module('juiceShop').controller('ProductDetailsController', [
  '$scope',
  '$sce',
  '$q',
  '$uibModal',
  'ProductService',
  'ProductReviewService',
  'UserService',
  'id',
  function ($scope, $sce, $q, $uibModal, productService, productReviewService, userService, id) {
    'use strict'

    productService.get(id).then(function (product) {
      $scope.product = product
      $scope.product.description = $sce.trustAsHtml($scope.product.description)
    }).catch(function (err) {
      console.log(err)
    })

    $q.all([
      productService.get(id),
      productReviewService.get(id),
      userService.whoAmI()
    ]).then(function (result) {
      var product = result[0]
      var reviews = result[1].data
      var user = result[2]

      $scope.product = product
      $scope.product.description = $sce.trustAsHtml($scope.product.description)
      $scope.productReviews = reviews.data

      if (user === undefined || user.email === undefined) {
        $scope.author = 'Anonymous'
      } else {
        $scope.author = user.email
      }
    },
      function (err) {
        console.log(err)
      }
    )

    $scope.addReview = function () {
      var review = { message: $scope.message, author: $scope.author }
      $scope.productReviews.push(review)
      productReviewService.create(id, review)
    }

    $scope.refreshReviews = function () {
      productReviewService.get(id).then(function (result) {
        $scope.productReviews = result.data.data
      })
    }

    $scope.editReview = function (review) {
      $uibModal.open({
        templateUrl: 'views/ProductReviewEdit.html',
        controller: 'ProductReviewEditController',
        bindings: {
          resolve: '<',
          close: '&',
          dismiss: '&'
        },
        size: 'lg',
        resolve: {
          review: function () {
            return review
          }
        }
      }).result.then(function (value) {
        $scope.refreshReviews()
      }, function () {
        console.log('Cancelled')
      })
    }
  }])
