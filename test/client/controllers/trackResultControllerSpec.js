describe('controllers', function () {
  var scope, controller, $httpBackend, $sce

  beforeEach(module('juiceShop'))
  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend')
    $httpBackend.whenGET(/\/i18n\/.*\.json/).respond(200, {})
    $httpBackend.whenGET(/views\/.*\.html/).respond(200, {})
    $sce = $injector.get('$sce')
  }))

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation()
    $httpBackend.verifyNoOutstandingRequest()
  })

  describe('TrackResultController', function () {
    beforeEach(inject(function ($rootScope, $controller) {
      scope = $rootScope.$new()
      controller = $controller('TrackResultController', {
        '$scope': scope
      })
    }))

    it('should be defined', inject(function () {
      $httpBackend.flush()
      expect(controller).toBeDefined()
    }))

    it('should get tracking results with given id', inject(function () {
      $httpBackend.expectGET('/rest/track-order/5267-f9cd5882f54c75a3').respond(200, {data: {orderId: 'Test Juice'}})

      $httpBackend.flush()

      expect(scope.results).toBeDefined()
      expect(scope.results.orderId).toBe('Test Juice')
    }))

    it('should render tracking results as trusted HTML', inject(function () {
      $httpBackend.expectGET('/rest/track-order/5267-f9cd5882f54c75a3').respond(200, {data: {description: '<script>alert("XSS")</script>'}})
      spyOn($sce, 'trustAsHtml')

      $httpBackend.flush()

      expect($sce.trustAsHtml).toHaveBeenCalledWith('<script>alert("XSS")</script>')
    }))
  })
})
