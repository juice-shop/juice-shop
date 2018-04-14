describe('controllers', function () {
  var scope, controller, $httpBackend

  beforeEach(module('juiceShop'))
  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend')
    $httpBackend.whenGET(/\/i18n\/.*\.json/).respond(200, {})
    $httpBackend.whenGET(/views\/.*\.html/).respond(200, {})
    $httpBackend.whenGET('/rest/user/whoami').respond(200, {user: {}})
    $httpBackend.whenGET('/rest/admin/application-configuration').respond(200, {config: {}})
    $httpBackend.whenGET('/rest/admin/application-version').respond(200, {})
    $httpBackend.whenGET('/api/Challenges/?name=Score+Board').respond(200, {data: [{solved: false}]})
  }))

  afterEach(function () {
    // $httpBackend.verifyNoOutstandingExpectation()
    // $httpBackend.verifyNoOutstandingRequest()
  })

  describe('NavbarController', function () {
    beforeEach(inject(function ($rootScope, $controller) {
      scope = $rootScope.$new()
      controller = $controller('NavbarController', {
        '$scope': scope
      })
      expect(scope.applicationName).toBeDefined()
      expect(scope.gitHubRibbon).toBeDefined()
    }))

    it('should be defined', inject(function () {
      $httpBackend.flush()

      expect(controller).toBeDefined()
    }))

    it('should hold application version', inject(function () {
      $httpBackend.expectGET('/rest/admin/application-version').respond(200, {version: 'x.y.z'})

      $httpBackend.flush()

      expect(scope.version).toBe('vx.y.z')
    }))

    it('should show nothing on missing application version', inject(function () {
      $httpBackend.expectGET('/rest/admin/application-version').respond(200, {})

      $httpBackend.flush()

      expect(scope.version).toBe('')
    }))

    it('should show nothing on error retrieving application version', inject(function () {
      $httpBackend.expectGET('/rest/admin/application-version').respond(500)

      $httpBackend.flush()

      expect(scope.version).toBe('')
    }))

    it('should log errors directly to browser console', inject(function () {
      $httpBackend.expectGET('/rest/admin/application-version').respond(500, 'error')

      console.log = jasmine.createSpy('log')

      $httpBackend.flush()

      expect(console.log).toHaveBeenCalledWith('error')
    }))

    it('should use default application name if not customized', inject(function () {
      $httpBackend.flush()

      expect(scope.applicationName).toBe('OWASP Juice Shop')
    }))

    it('should use custom application name URL if configured', inject(function () {
      $httpBackend.expectGET('/rest/admin/application-configuration').respond(200, {config: {application: {name: 'name'}}})

      $httpBackend.flush()

      expect(scope.applicationName).toBe('name')
    }))

    it('should set user email if user authenticated', inject(function () {
      $httpBackend.expectGET('/rest/admin/application-configuration').respond(200, {config: {application: {name: 'name'}}})
      $httpBackend.expectGET('/rest/user/whoami').respond(200, {user: {email: 'dummy@dummy.com'}})

      $httpBackend.flush()

      expect(scope.userEmail).toBe('dummy@dummy.com')
    }))

    it('should log errors directly to browser console when getting user failed', inject(function () {
      $httpBackend.expectGET('/rest/user/whoami').respond(500, 'error-user')

      console.log = jasmine.createSpy('log')

      $httpBackend.flush()

      expect(console.log).toHaveBeenCalledWith('error-user')
    }))

    it('should show GitHub ribbon in orange by default', inject(function () {
      $httpBackend.flush()

      expect(scope.gitHubRibbon).toBe('orange')
    }))

    it('should colorize GitHub ribbon as configured', inject(function () {
      $httpBackend.expectGET('/rest/admin/application-configuration').respond(200, {config: {application: {gitHubRibbon: 'white'}}})

      $httpBackend.flush()

      expect(scope.gitHubRibbon).toBe('white')
    }))

    it('should hide GitHub ribbon if configured as color "none"', inject(function () {
      $httpBackend.expectGET('/rest/admin/application-configuration').respond(200, {config: {application: {gitHubRibbon: 'none'}}})

      $httpBackend.flush()

      expect(scope.gitHubRibbon).toBeNull()
    }))

    it('should log error while getting application configuration from backend API directly to browser console', inject(function () {
      $httpBackend.expectGET('/rest/admin/application-configuration').respond(500, 'error')

      console.log = jasmine.createSpy('log')

      $httpBackend.flush()

      expect(console.log).toHaveBeenCalledWith('error')
    }))

    it('should hide Score Board menu item when corresponding challenge was not solved yet', inject(function () {
      $httpBackend.expectGET('/api/Challenges/?name=Score+Board').respond(200, {data: [{solved: false}]})

      $httpBackend.flush()

      expect(scope.scoreBoardMenuVisible).toBe(false)
    }))

    it('should show Score Board menu item when corresponding challenge was solved', inject(function () {
      $httpBackend.expectGET('/api/Challenges/?name=Score+Board').respond(200, {data: [{solved: true}]})

      $httpBackend.flush()

      expect(scope.scoreBoardMenuVisible).toBe(true)
    }))
  })
})
