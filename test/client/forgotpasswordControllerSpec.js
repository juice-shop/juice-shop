describe('controllers', function () {
  var scope, controller, $httpBackend

  beforeEach(module('juiceShop'))
  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend')
    $httpBackend.whenGET(/\/i18n\/.*\.json/).respond(200, {})
  }))

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation()
  })

  describe('ForgotPasswordController', function () {
    beforeEach(inject(function ($rootScope, $location, $controller) {
      scope = $rootScope.$new()
      controller = $controller('ForgotPasswordController', {
        '$scope': scope
      })
    }))

    it('should be defined', inject(function () {
      expect(controller).toBeDefined()
      expect(scope.resetPassword).toBeDefined()
      expect(scope.findSecurityQuestion).toBeDefined()
    }))

    it('should clear form and show confirmation after changing password', inject(function () {
      $httpBackend.whenPOST('/rest/user/reset-password').respond(200, {user: {}})
      scope.email = 'foobar'
      scope.securityQuestion = 'foobar?'
      scope.securityAnswer = 'foobar!'
      scope.newPassword = 'foobar'
      scope.newPasswordRepeat = 'foobar'
      scope.form = {$setPristine: function () {}}

      scope.resetPassword()
      $httpBackend.flush()

      expect(scope.email).toBeUndefined()
      expect(scope.securityQuestion).toBeUndefined()
      expect(scope.securityAnswer).toBeUndefined()
      expect(scope.newPassword).toBeUndefined()
      expect(scope.newPasswordRepeat).toBeUndefined()
      expect(scope.confirmation).toBeDefined()
    }))

    it('should clear form and gracefully handle error on password change', inject(function () {
      $httpBackend.whenPOST('/rest/user/reset-password').respond(500, 'error')
      scope.email = 'foobar'
      scope.securityQuestion = 'foobar?'
      scope.securityAnswer = 'foobar!'
      scope.newPassword = 'foobar'
      scope.newPasswordRepeat = 'foobar'
      scope.form = {$setPristine: function () {}}

      scope.resetPassword()
      $httpBackend.flush()

      expect(scope.email).toBeUndefined()
      expect(scope.securityQuestion).toBeUndefined()
      expect(scope.securityAnswer).toBeUndefined()
      expect(scope.newPassword).toBeUndefined()
      expect(scope.newPasswordRepeat).toBeUndefined()
      expect(scope.error).toBe('error')
    }))

    xit('should find the security question of a user with a known email address', inject(function () {
      $httpBackend.whenGET('rest/user/security-question?email=known@user.test').respond(200, { question: 'What is your favorite test tool?' })
      scope.email = 'known@user.test'

      scope.findSecurityQuestion()
      $httpBackend.flush()

      expect(scope.securityQuestion).toBe('What is your favorite test tool?')
    }))

    xit('should not find the security question for an email address not bound to a user', inject(function () {
      $httpBackend.whenGET('rest/user/security-question?email=unknown@user.test').respond(200, {})
      scope.email = 'unknown@user.test'

      scope.findSecurityQuestion()
      $httpBackend.flush()

      expect(scope.securityQuestion).toBeUndefined()
    }))

    it('should find not attempt to find security question for empty email address', inject(function () {
      scope.email = undefined

      scope.findSecurityQuestion()
      $httpBackend.flush()

      expect(scope.securityQuestion).toBeUndefined()
    }))
  })
})
