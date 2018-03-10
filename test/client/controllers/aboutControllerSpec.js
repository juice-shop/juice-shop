describe('controllers', function () {
  var scope, controller, $httpBackend

  beforeEach(module('juiceShop'))
  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend')
    $httpBackend.whenGET(/\/i18n\/.*\.json/).respond(200, {})
    $httpBackend.whenGET('/rest/admin/application-configuration').respond(200, {config: {}})
  }))

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation()
    $httpBackend.verifyNoOutstandingRequest()
  })

  describe('AboutController', function () {
    beforeEach(inject(function ($rootScope, $controller) {
      scope = $rootScope.$new()
      controller = $controller('AboutController', {
        '$scope': scope
      })
    }))

    it('should be defined', inject(function () {
      expect(controller).toBeDefined()
    }))

    it('should not hold twitter or facebook URL if not defined in configuration', inject(function () {
      $httpBackend.expectGET('/rest/admin/application-configuration').respond(200, {config: {}})

      $httpBackend.flush()

      expect(scope.twitterUrl).toBe(null)
      expect(scope.facebookUrl).toBe(null)
    }))

    it('should use custom twitter URL if configured', inject(function () {
      $httpBackend.expectGET('/rest/admin/application-configuration').respond(200, {config: {application: {twitterUrl: 'twitter'}}})

      $httpBackend.flush()

      expect(scope.twitterUrl).toBe('twitter')
    }))

    it('should use custom facebook URL if configured', inject(function () {
      $httpBackend.expectGET('/rest/admin/application-configuration').respond(200, {config: {application: {facebookUrl: 'facebook'}}})

      $httpBackend.flush()

      expect(scope.facebookUrl).toBe('facebook')
    }))

    it('should log error while getting application configuration from backend API directly to browser console', inject(function () {
      $httpBackend.expectGET('/rest/admin/application-configuration').respond(500, 'error')

      console.log = jasmine.createSpy('log')

      $httpBackend.flush()

      expect(console.log).toHaveBeenCalledWith('error')
    }))
  })
})
