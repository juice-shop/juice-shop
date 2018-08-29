describe('controllers', function () {
  var scope, controller, $httpBackend, $sce

  beforeEach(module('juiceShop'))
  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend')
    $httpBackend.whenGET(/\/i18n\/.*\.json/).respond(200, {})
    $httpBackend.whenGET(/views\/.*\.html/).respond(200, {})
    $httpBackend.whenGET('/rest/track-order/undefined').respond(200)
    $sce = $injector.get('$sce')
  }))

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation()
    $httpBackend.verifyNoOutstandingRequest()
  })

  describe('TrackResultController', function () {
    beforeEach(inject(function ($rootScope, $location, $controller) {
      scope = $rootScope.$new()
      controller = $controller('TrackResultController', {
        '$scope': scope
      })
    }))

    it('should be defined', inject(function () {
      $httpBackend.flush()
      expect(controller).toBeDefined()
    }))

    it('should render order no. from tracking results as trusted HTML', inject(function () {
      $httpBackend.expectGET('/rest/track-order/undefined').respond(200, { data: [{ orderId: '<script>alert("XSS")</script>' }] })
      spyOn($sce, 'trustAsHtml')

      $httpBackend.flush()

      expect($sce.trustAsHtml).toHaveBeenCalledWith('<script>alert("XSS")</script>')
    }))
  })
})
