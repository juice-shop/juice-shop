describe('controllers', function () {
  var scope, location, controller, window, cookieStore, $httpBackend

  beforeEach(module('juiceShop'))
  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend')
    $httpBackend.whenGET(/\/i18n\/.*\.json/).respond(200, {})
  }))

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation()
  })

  describe('LoginController', function () {
    beforeEach(inject(function ($rootScope, $window, $location, $cookieStore, $controller) {
      console.log = jasmine.createSpy('log')
      scope = $rootScope.$new()
      location = $location
      window = $window
      cookieStore = $cookieStore
      controller = $controller('LoginController', {
        '$scope': scope
      })
      scope.form = {$setPristine: function () {}}
      window.location.replace = jasmine.createSpy()
      window.onbeforeunload = function () { return 'Prevent "Some of your tests did a full page reload" errors' }
    }))

    it('should be defined', inject(function () {
      expect(controller).toBeDefined()
      expect(scope.login).toBeDefined()
      expect(scope.googleLogin).toBeDefined()
    }))

    it('should flag OAuth as disabled if server is running on unauthorized redirect URI', inject(function () {
      // Karma typically runs on localhost:9876 which is not authorized in Google API Console for OWASP Juice Shop app
      expect(scope.oauthUnavailable).toBe(true)
      expect(console.log.mostRecentCall.args[0]).toMatch(/.* is not an authorized redirect URI for this application\./)
    }))

    it('forwards to main page after successful login', inject(function () {
      $httpBackend.whenPOST('/rest/user/login').respond(200, {})

      scope.login()
      $httpBackend.flush()

      expect(location.path()).toBe('/')
    }))

    it('sets the returned authentication token as session cookie', inject(function () {
      $httpBackend.whenPOST('/rest/user/login').respond(200, {token: 'auth_token'})

      scope.login()
      $httpBackend.flush()

      expect(cookieStore.get('token')).toBe('auth_token')
    }))

    it('puts the returned basket id into browser session storage', inject(function () {
      $httpBackend.whenPOST('/rest/user/login').respond(200, {bid: 4711})

      scope.login()
      $httpBackend.flush()

      expect(window.sessionStorage.bid).toBe('4711')
    }))

    it('removes authentication token and basket id on failed login attempt', inject(function () {
      $httpBackend.whenPOST('/rest/user/login').respond(401)

      scope.login()
      $httpBackend.flush()

      expect(cookieStore.get('token')).toBeUndefined()
      expect(window.sessionStorage.bid).toBeUndefined()
    }))

    it('returns error message from server to client on failed login attempt', inject(function () {
      $httpBackend.whenPOST('/rest/user/login').respond(401, 'error')

      scope.login()
      $httpBackend.flush()

      expect(scope.error).toBe('error')
    }))

    it('forwards to Google API when performing OAuth login', inject(function () {
      scope.googleLogin()

      expect(window.location.replace).toHaveBeenCalledWith('https://accounts.google.com/o/oauth2/v2/auth?client_id=1005568560502-6hm16lef8oh46hr2d98vf2ohlnj4nfhq.apps.googleusercontent.com&response_type=token&scope=email&redirect_uri=undefined')
    }))

    it('has unticked remember-me checkbox if "email" cookie is not present', inject(function () {
      cookieStore.remove('email')
      scope.$digest()
      $httpBackend.flush()

      expect(scope.rememberMe).toBe(false)
    }))

    xit('has ticked remember-me checkbox and pre-filled email field if "email" cookie is present', inject(function () {
      cookieStore.put('email', 'horst@juice-sh.op')
      scope.$digest()
      $httpBackend.flush()

      expect(scope.rememberMe).toBe(true)
      expect(scope.user.email).toBe('horst@juice-sh.op')
    }))

    it('puts current email into "email" cookie on successful login with remember-me checkbox ticked', inject(function () {
      $httpBackend.whenPOST('/rest/user/login').respond(200, {})
      scope.user = {email: 'horst@juice-sh.op'}
      scope.rememberMe = true

      scope.login()
      $httpBackend.flush()

      expect(cookieStore.get('email')).toBe('horst@juice-sh.op')
    }))

    it('puts current email into "email" cookie on failed login with remember-me checkbox ticked', inject(function () {
      $httpBackend.whenPOST('/rest/user/login').respond(401)
      scope.user = {email: 'horst@juice-sh.op'}
      scope.rememberMe = true

      scope.login()
      $httpBackend.flush()

      expect(cookieStore.get('email')).toBe('horst@juice-sh.op')
    }))
  })
})
