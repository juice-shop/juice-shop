describe('controllers', function () {
  var scope, location, controller, window, cookies, $httpBackend

  beforeEach(module('juiceShop'))
  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend')
    $httpBackend.whenGET(/\/i18n\/.*\.json/).respond(200, {})
    $httpBackend.whenGET(/views\/.*\.html/).respond(200, {})
  }))

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation()
  })

  describe('LoginController', function () {
    beforeEach(inject(function ($rootScope, $window, $location, $cookies, $controller) {
      console.log = jasmine.createSpy('log')
      scope = $rootScope.$new()
      location = $location
      window = $window
      cookies = $cookies
      controller = $controller('LoginController', {
        '$scope': scope
      })
      scope.form = {$setPristine: function () {}}
    }))

    it('should be defined', inject(function () {
      expect(controller).toBeDefined()
      expect(scope.login).toBeDefined()
      expect(scope.googleLogin).toBeDefined()
    }))

    it('should flag OAuth as disabled if server is running on unauthorized redirect URI', inject(function () {
      // Karma typically runs on localhost:9876 which is not authorized in Google API Console for OWASP Juice Shop app
      expect(scope.oauthUnavailable).toBe(true)
      expect(console.log.calls.mostRecent().args[0]).toMatch(/.* is not an authorized redirect URI for this application\./)
    }))

    it('forwards to main page after successful login', inject(function () {
      $httpBackend.whenPOST('/rest/user/login').respond(200, {authentication: {}})

      scope.login()
      $httpBackend.flush()

      expect(location.path()).toBe('/search')
    }))

    it('sets the returned authentication token as session cookie', inject(function () {
      $httpBackend.whenPOST('/rest/user/login').respond(200, {authentication: {token: 'auth_token'}})

      scope.login()
      $httpBackend.flush()

      expect(cookies.get('token')).toBe('auth_token')
    }))

    it('puts the returned basket id into browser session storage', inject(function () {
      $httpBackend.whenPOST('/rest/user/login').respond(200, {authentication: {bid: 4711}})

      scope.login()
      $httpBackend.flush()

      expect(window.sessionStorage.bid).toBe('4711')
    }))

    it('removes authentication token and basket id on failed login attempt', inject(function () {
      $httpBackend.whenPOST('/rest/user/login').respond(401)

      scope.login()
      $httpBackend.flush()

      expect(cookies.get('token')).toBeUndefined()
      expect(window.sessionStorage.bid).toBeUndefined()
    }))

    it('returns error message from server to client on failed login attempt', inject(function () {
      $httpBackend.whenPOST('/rest/user/login').respond(401, 'error')

      scope.login()
      $httpBackend.flush()

      expect(scope.error).toBe('error')
    }))

    xit('has unticked remember-me checkbox by default', inject(function () {
      $httpBackend.flush()

      expect(scope.rememberMe).toBe(false)
    }))

    it('puts current email into "email" cookie on successful login with remember-me checkbox ticked', inject(function () {
      $httpBackend.whenPOST('/rest/user/login').respond(200, {authentication: {}})
      scope.user = {email: 'horst@juice-sh.op'}
      scope.rememberMe = true

      scope.login()
      $httpBackend.flush()

      expect(cookies.get('email')).toBe('horst@juice-sh.op')
      cookies.remove('email')
    }))

    it('puts current email into "email" cookie on failed login with remember-me checkbox ticked', inject(function () {
      $httpBackend.whenPOST('/rest/user/login').respond(401)
      scope.user = {email: 'horst@juice-sh.op'}
      scope.rememberMe = true

      scope.login()
      $httpBackend.flush()

      expect(cookies.get('email')).toBe('horst@juice-sh.op')
      cookies.remove('email')
    }))
  })
})
