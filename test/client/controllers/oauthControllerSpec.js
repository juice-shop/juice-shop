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

  describe('OAuthController', function () {
    beforeEach(inject(function ($rootScope, $controller, $window, $location, $cookies) {
      scope = $rootScope.$new()
      window = $window
      location = $location
      cookies = $cookies
      controller = $controller('OAuthController', {
        '$scope': scope
      })
    }))

    it('should be defined', inject(function () {
      $httpBackend.whenGET(/https:\/\/www\.googleapis\.com\/oauth2\/v1\/userinfo\?alt=json&access_token=/).respond(200)
      expect(controller).toBeDefined()
    }))

    describe('successful authentication', function () {
      beforeEach(inject(function () {
        $httpBackend.whenGET(/https:\/\/www\.googleapis\.com\/oauth2\/v1\/userinfo\?alt=json&access_token=/).respond(200, { email: 'horst@g00glemail.com' })
      }))

      describe('successful account creation', function () {
        beforeEach(inject(function () {
          $httpBackend.whenPOST('/api/Users/').respond(200, { data: {} })
        }))

        it('should set session data and forward to main page after successful login', inject(function () {
          $httpBackend.whenPOST('/rest/user/login').respond(200, { authentication: { token: 'auth_token', bid: '4711' } })
          $httpBackend.flush()

          expect(cookies.get('token')).toBe('auth_token')
          expect(window.sessionStorage.bid).toBe('4711')
          expect(location.path()).toBe('/search')
        }))

        it('should remove session data and redirect to login page after failed login', inject(function () {
          $httpBackend.whenPOST('/rest/user/login').respond(401)
          $httpBackend.flush()

          expect(cookies.get('token')).toBeUndefined()
          expect(window.sessionStorage.bid).toBeUndefined()
          expect(location.path()).toBe('/login')
        }))
      })

      describe('failed account creation', function () {
        beforeEach(inject(function () {
          $httpBackend.whenPOST('/api/Users/').respond(500)
        }))

        it('should set session data and forward to main page after successful login', inject(function () {
          $httpBackend.whenPOST('/rest/user/login').respond(200, { authentication: { token: 'auth_token', bid: '4711' } })
          $httpBackend.flush()

          expect(cookies.get('token')).toBe('auth_token')
          expect(window.sessionStorage.bid).toBe('4711')
          expect(location.path()).toBe('/search')
        }))

        it('should remove session data and redirect to login page after failed login', inject(function () {
          $httpBackend.whenPOST('/rest/user/login').respond(401)
          $httpBackend.flush()

          expect(cookies.get('token')).toBeUndefined()
          expect(window.sessionStorage.bid).toBeUndefined()
          expect(location.path()).toBe('/login')
        }))
      })
    })

    it('should remove session data and redirect to login page after failing to retrieve OAuth token', inject(function () {
      $httpBackend.whenGET(/https:\/\/www\.googleapis\.com\/oauth2\/v1\/userinfo\?alt=json&access_token=/).respond(401)
      $httpBackend.flush()

      expect(cookies.get('token')).toBeUndefined()
      expect(window.sessionStorage.bid).toBeUndefined()
      expect(location.path()).toBe('/login')
    }))
  })
})
