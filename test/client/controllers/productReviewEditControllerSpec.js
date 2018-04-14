describe('controllers', function () {
  var scope, controller, uibModalInstance, $httpBackend

  beforeEach(module('juiceShop'))
  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend')
    $httpBackend.whenGET(/\/i18n\/.*\.json/).respond(200, {})
    $httpBackend.whenGET(/views\/.*\.html/).respond(200, {})
  }))

  afterEach(function () {
    // $httpBackend.verifyNoOutstandingExpectation()
    // $httpBackend.verifyNoOutstandingRequest()
  })

  describe('ProductReviewEditController', function () {
    beforeEach(inject(function ($rootScope, $controller) {
      scope = $rootScope.$new()
      uibModalInstance = { close: function () {}, dismiss: function () {} }
      controller = $controller('ProductReviewEditController', {
        '$scope': scope,
        '$uibModalInstance': uibModalInstance,
        'review': { _id: 42, message: 'Review' }
      })
    }))

    it('should be defined', inject(function () {
      expect(controller).toBeDefined()

      $httpBackend.flush()
    }))

    it('should be initialized with data from the passed review', inject(function () {
      expect(scope.id).toBe(42)
      expect(scope.message).toBe('Review')

      $httpBackend.flush()
    }))

    it('should update review through backend API', inject(function () {
      scope.id = 43
      scope.message = 'Another Review'
      scope.editReview()

      $httpBackend.expectPATCH('/rest/product/reviews', {id: 43, message: 'Another Review'}).respond(200, {data: {}})

      $httpBackend.flush()
    }))

    it('should log errors directly to browser console', inject(function () {
      $httpBackend.whenPATCH('/rest/product/reviews').respond(500, 'error')
      console.log = jasmine.createSpy('log')

      scope.editReview()
      $httpBackend.flush()

      expect(console.log).toHaveBeenCalledWith('error')
    }))
  })
})
