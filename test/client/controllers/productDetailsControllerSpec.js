describe('controllers', function () {
  var scope, controller, $httpBackend, $sce, $uibModal

  beforeEach(module('juiceShop'))
  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend')
    $httpBackend.whenGET(/\/i18n\/.*\.json/).respond(200, {})
    $httpBackend.whenGET(/views\/.*\.html/).respond(200, {})
    $httpBackend.whenGET(/\/api\/Products\/42/).respond(200, { data: {} })
    $httpBackend.whenGET('/rest/product/42/reviews').respond(200, { data: [] })
    $httpBackend.whenGET('/rest/user/whoami').respond(200, { user: {} })
    $sce = $injector.get('$sce')
    $uibModal = $injector.get('$uibModal')
  }))

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation()
    $httpBackend.verifyNoOutstandingRequest()
  })

  describe('ProductDetailsController', function () {
    beforeEach(inject(function ($rootScope, $controller) {
      scope = $rootScope.$new()
      controller = $controller('ProductDetailsController', {
        '$scope': scope,
        'id': 42
      })
    }))

    it('should be defined', inject(function () {
      $httpBackend.flush()

      expect(controller).toBeDefined()
    }))

    it('should hold single product with given id', inject(function () {
      $httpBackend.expectGET(/\/api\/Products\/42/).respond(200, { data: { name: 'Test Juice' } })

      $httpBackend.flush()

      expect(scope.product).toBeDefined()
      expect(scope.product.name).toBe('Test Juice')
    }))

    it('should render product description as trusted HTML', inject(function () {
      $httpBackend.expectGET(/\/api\/Products\/42/).respond(200, { data: { description: '<script>alert("XSS")</script>' } })
      spyOn($sce, 'trustAsHtml')

      $httpBackend.flush()

      expect($sce.trustAsHtml).toHaveBeenCalledWith('<script>alert("XSS")</script>')
    }))

    it('should hold no product if API call fails', inject(function () {
      $httpBackend.expectGET(/\/api\/Products\/42/).respond(500)

      $httpBackend.flush()

      expect(scope.product).toBeUndefined()
    }))

    it('should post anonymous review if no user email is returned', inject(function () {
      $httpBackend.expectGET('/rest/user/whoami').respond(200, { user: {} })
      $httpBackend.flush()

      scope.message = 'Great product!'
      scope.addReview()

      $httpBackend.expectPUT('/rest/product/42/reviews', { message: 'Great product!', author: 'Anonymous' }).respond(200, { data: {} })
      $httpBackend.flush()
    }))

    it('should post review with user email as author', inject(function () {
      $httpBackend.expectGET('/rest/user/whoami').respond(200, { user: { email: 'horst@juice-sh.op' } })
      $httpBackend.flush()

      scope.message = 'Great product!'
      scope.addReview()

      $httpBackend.expectPUT('/rest/product/42/reviews', { message: 'Great product!', author: 'horst@juice-sh.op' }).respond(200, { data: {} })
      $httpBackend.flush()
    }))

    it('should log errors when retrieving product directly to browser console', inject(function () {
      $httpBackend.expectGET(/\/api\/Products\/42/).respond(500, 'error')
      console.log = jasmine.createSpy('log')

      $httpBackend.flush()

      expect(console.log).toHaveBeenCalledWith('error')
    }))

    it('should log errors when retrieving reviews directly to browser console', inject(function () {
      $httpBackend.expectGET('/rest/product/42/reviews').respond(500, 'error')
      console.log = jasmine.createSpy('log')

      $httpBackend.flush()

      expect(console.log).toHaveBeenCalledWith('error')
    }))

    it('should log errors when retrieving user directly to browser console', inject(function () {
      $httpBackend.expectGET('/rest/user/whoami').respond(500, 'error')
      console.log = jasmine.createSpy('log')

      $httpBackend.flush()

      expect(console.log).toHaveBeenCalledWith('error')
    }))

    it('should open a modal dialog with review editor', inject(function () {
      spyOn($uibModal, 'open').and.returnValue(
        { result: { then: function () { } } })

      $httpBackend.flush()

      scope.editReview()

      expect($uibModal.open).toHaveBeenCalledWith({
        templateUrl: 'views/ProductReviewEdit.html',
        controller: 'ProductReviewEditController',
        bindings: jasmine.any(Object),
        size: jasmine.any(String),
        resolve: { review: jasmine.any(Function) }
      })
    }))

    it('should refresh reviews of product after adding a review', inject(function () {
      spyOn($uibModal, 'open').and.returnValue(
        { result: { then: function () { scope.refreshReviews() } } })
      spyOn(scope, 'refreshReviews')

      $httpBackend.flush()
      scope.editReview()

      expect(scope.refreshReviews).toHaveBeenCalled()
    }))

    it('should increment likes count of review after liking a review', inject(function () {
      scope.id = 43
      scope.likeReview(43)
      $httpBackend.when('POST', '/rest/product/reviews').respond(200, {})
      $httpBackend.flush()
    }))
  })
})
