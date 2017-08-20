describe('controllers', function () {
  var scope, controller, $httpBackend, $sce

  beforeEach(module('juiceShop'))
  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend')
    $httpBackend.whenGET(/\/i18n\/.*\.json/).respond(200, {})
    $httpBackend.whenGET('/rest/product/42/reviews').respond(200, {data: {}})
    $httpBackend.whenGET('/rest/user/whoami').respond(200, {data: {}})
    $sce = $injector.get('$sce')
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
      $httpBackend.whenGET(/\/api\/Products\/42/).respond(200, {data: {}})

      $httpBackend.flush()

      expect(controller).toBeDefined()
    }))

    it('should hold single product with given id', inject(function () {
      $httpBackend.whenGET(/\/api\/Products\/42/).respond(200, {data: {name: 'Test Juice'}})

      $httpBackend.flush()

      expect(scope.product).toBeDefined()
      expect(scope.product.name).toBe('Test Juice')
    }))

    it('should render product description as trusted HTML', inject(function () {
      $httpBackend.whenGET(/\/api\/Products\/42/).respond(200, {data: {description: '<script>alert("XSS3")</script>'}})
      spyOn($sce, 'trustAsHtml')

      $httpBackend.flush()

      expect($sce.trustAsHtml).toHaveBeenCalledWith('<script>alert("XSS3")</script>')
    }))

    it('should hold no product if API call fails', inject(function () {
      $httpBackend.whenGET(/\/api\/Products\/42/).respond(500)

      $httpBackend.flush()

      expect(scope.product).toBeUndefined()
    }))

    it('should log errors directly to browser console', inject(function () {
      $httpBackend.whenGET(/\/api\/Products\/42/).respond(500, 'error')
      console.log = jasmine.createSpy('log')

      $httpBackend.flush()

      expect(console.log).toHaveBeenCalledWith('error')
    }))
  })
})
