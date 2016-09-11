angular.module('juiceShop').controller('FeedbackController', [
  '$scope',
  '$sce',
  'FeedbackService',
  function ($scope, $sce, feedbackService) {
    'use strict'
    $scope.interval = 5000
    $scope.noWrapSlides = false
    $scope.active = 0

    var images = [
      'public/images/carousel/1.jpg',
      'public/images/carousel/2.jpg',
      'public/images/carousel/3.jpg',
      'public/images/carousel/4.jpg',
      'public/images/carousel/5.jpg',
      'public/images/carousel/6.jpg',
      'public/images/carousel/7.jpg'
    ]

    function findAll () {
      feedbackService.find().success(function (feedbacks) {
        $scope.feedbacks = feedbacks.data
        for (var i = 0; i < $scope.feedbacks.length; i++) {
          $scope.feedbacks[i].comment = $sce.trustAsHtml($scope.feedbacks[i].comment)
          $scope.feedbacks[i].image = images[i % images.length]
        }
      }).error(function (err) {
        console.log(err)
      })
    }
    findAll()

    $scope.delete = function (id) {
      feedbackService.del(id).success(function () {
        findAll()
      }).error(function (err) {
        console.log(err)
      })
    }
  }])
