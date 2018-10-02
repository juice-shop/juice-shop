describe('controllers', function () {
  var scope, controller, $httpBackend

  beforeEach(module('juiceShop'))
  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend')
    $httpBackend.whenGET(/\/i18n\/.*\.json/).respond(200, {})
    $httpBackend.whenGET(/views\/.*\.html/).respond(200, {})
  }))

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation()
  })

  describe('ChangePasswordController', function () {
    beforeEach(inject(function ($rootScope, $location, $controller) {
      scope = $rootScope.$new()
      controller = $controller('ChangePasswordController', {
        '$scope': scope
      })
    }))

    it('should be defined', inject(function () {
      expect(controller).toBeDefined()
      expect(scope.changePassword).toBeDefined()
    }))

    it('should clear form and show confirmation after changing password', inject(function () {
      $httpBackend.whenGET('/rest/user/change-password?current=old&new=foobar&repeat=foobar').respond(200, { user: {} })
      scope.currentPassword = 'old'
      scope.newPassword = 'foobar'
      scope.newPasswordRepeat = 'foobar'
      scope.form = { $setPristine: function () {} }

      scope.changePassword()
      $httpBackend.flush()

      expect(scope.currentPassword).toBeUndefined()
      expect(scope.newPassword).toBeUndefined()
      expect(scope.newPasswordRepeat).toBeUndefined()
      expect(scope.confirmation).toBeDefined()
    }))

    it('should clear form and gracefully handle error on password change', inject(function () {
      $httpBackend.whenGET('/rest/user/change-password?current=old&new=foobar&repeat=foobar').respond(500, 'error')
      scope.currentPassword = 'old'
      scope.newPassword = 'foobar'
      scope.newPasswordRepeat = 'foobar'
      scope.form = { $setPristine: function () {} }

      scope.changePassword()
      $httpBackend.flush()

      expect(scope.currentPassword).toBeUndefined()
      expect(scope.newPassword).toBeUndefined()
      expect(scope.newPasswordRepeat).toBeUndefined()
      expect(scope.error).toBe('error')
    }))
  })
})
