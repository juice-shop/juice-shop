describe('controllers', function () {
  var scope, controller, cookies, $httpBackend

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
    beforeEach(inject(function ($rootScope, $cookies, $controller) {
      scope = $rootScope.$new()
      cookies = $cookies
      cookies.put('email', 'horst@juice-sh.op')
      controller = $controller('LoginController', {
        '$scope': scope
      })
      scope.form = { $setPristine: function () {} }
    }))

    it('has ticked remember-me checkbox and pre-filled email field if "email" cookie is present', inject(function () {
      expect(controller).toBeDefined()

      $httpBackend.flush()

      expect(scope.rememberMe).toBe(true)
      expect(scope.user.email).toBe('horst@juice-sh.op')
    }))

    it('puts current email into "email" cookie on successful login with remember-me checkbox ticked', inject(function () {
      $httpBackend.whenPOST('/rest/user/login').respond(200, { authentication: {} })
      scope.user = { email: 'otto@juice-sh.op' }
      scope.rememberMe = false

      scope.login()
      $httpBackend.flush()

      expect(cookies.get('email')).toBeUndefined()
    }))
  })
})
