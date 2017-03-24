describe('controllers', function () {
  var scope, controller, $httpBackend

  beforeEach(module('juiceShop'))
  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend')
    $httpBackend.whenGET(/\/i18n\/.*\.json/).respond(200, {})
  }))

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation()
    $httpBackend.verifyNoOutstandingRequest()
  })

  describe('NavbarController', function () {
    beforeEach(inject(function ($rootScope, $controller) {
      scope = $rootScope.$new()
      controller = $controller('NavbarController', {
        '$scope': scope
      })
      expect(scope.applicationName).toBeDefined()
      expect(scope.applicationTheme).toBeDefined()
    }))

    it('should be defined', inject(function () {
      $httpBackend.whenGET('/rest/admin/application-configuration').respond(200, {})
      $httpBackend.whenGET('/rest/admin/application-version').respond(200)

      $httpBackend.flush()

      expect(controller).toBeDefined()
    }))

    it('should hold application version', inject(function () {
      $httpBackend.whenGET('/rest/admin/application-configuration').respond(200, {})
      $httpBackend.whenGET('/rest/admin/application-version').respond(200, {version: 'x.y.z'})

      $httpBackend.flush()

      expect(scope.version).toBe('vx.y.z')
    }))

    it('should show nothing on missing application version', inject(function () {
      $httpBackend.whenGET('/rest/admin/application-configuration').respond(200, {})
      $httpBackend.whenGET('/rest/admin/application-version').respond(200, {})

      $httpBackend.flush()

      expect(scope.version).toBe('')
    }))

    it('should show nothing on error retrieving application version', inject(function () {
      $httpBackend.whenGET('/rest/admin/application-configuration').respond(200, {})
      $httpBackend.whenGET('/rest/admin/application-version').respond(500)

      $httpBackend.flush()

      expect(scope.version).toBe('')
    }))

    it('should log errors directly to browser console', inject(function () {
      $httpBackend.whenGET('/rest/admin/application-configuration').respond(200, {})
      $httpBackend.whenGET('/rest/admin/application-version').respond(500, 'error')
      console.log = jasmine.createSpy('log')

      $httpBackend.flush()

      expect(console.log).toHaveBeenCalledWith('error')
    }))

    it('should be defined', inject(function () {
      $httpBackend.whenGET('/rest/admin/application-version').respond(200, {})
      $httpBackend.whenGET('/rest/admin/application-configuration').respond(200)

      $httpBackend.flush()

      expect(controller).toBeDefined()
    }))
  })
})
