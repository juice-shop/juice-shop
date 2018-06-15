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

    $q.all([
      productService.get(id),
      productReviewService.get(id),
      userService.whoAmI()
    ]).then(function (result) {
      var product = result[0]
      var reviews = result[1]
      var user = result[2]

      $scope.product = product
      $scope.product.description = $sce.trustAsHtml($scope.product.description)
      $scope.productReviews = reviews

      if (user && user.email) {
        $scope.author = user.email
      } else {
        $scope.author = 'Anonymous'
      }
    }).catch(function (err) {
      console.log(err)
    })

    $scope.addReview = function () {
      var review = { message: $scope.message, author: $scope.author }
      $scope.productReviews.push(review)
      productReviewService.create(id, review)
      $scope.refreshReviews()
    }

    $scope.likeReview = function (review) {
      productReviewService.like(review._id)
      setTimeout(function() {
        $scope.refreshReviews()
      }, 200);
    }

    $scope.refreshReviews = function () {
      productReviewService.get(id).then(function (review) {
        $scope.productReviews = review
      }).catch(angular.noop)
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
      }).result.then(function () {
        $scope.refreshReviews()
      }, function () {
        console.log('Cancelled')
      })
    }
  }])
