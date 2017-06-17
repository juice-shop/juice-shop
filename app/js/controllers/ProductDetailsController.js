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

      if (reviews.msg !== undefined && reviews.msg === 'No NoSQL Database availible') {
        $scope.reviewsDisabled = true
      } else {
        $scope.reviewsDisabled = false
        $scope.productReviews = reviews.data
      }
      console.log('user', user)
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

    $scope.addComment = function () {
      var review = { message: $scope.message, author: $scope.author }
      $scope.productReviews.push(review)
      productReviewService.create(id, review)
    }

    $scope.refreshComments = function () {
      productReviewService.get(id).then(function (result) {
        $scope.productReviews = result.data.data
      })
    }

    $scope.editComment = function (comment) {
      $uibModal.open({
        templateUrl: 'views/ProductCommentEdit.html',
        controller: 'ProductCommentEditController',
        bindings: {
          resolve: '<',
          close: '&',
          dismiss: '&'
        },
        size: 'lg',
        resolve: {
          comment: function () {
            return comment
          }
        }
      }).result.then(function (value) {
        $scope.refreshComments()
      }, function () {
        console.log('Cancelled')
      })
    }
  }])
