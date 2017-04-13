describe('controllers', function () {
  var scope, location, controller, $httpBackend

  beforeEach(module('juiceShop'))
  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend')
    $httpBackend.whenGET(/\/i18n\/.*\.json/).respond(200, {})
  }))

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation()
  })

  describe('RegisterController', function () {
    beforeEach(inject(function ($rootScope, $controller, $location) {
      scope = $rootScope.$new()
      location = $location
      controller = $controller('RegisterController', {
        '$scope': scope
      })
    }))

    it('should be defined', inject(function () {
      expect(controller).toBeDefined()
      expect(scope.save).toBeDefined()
    }))

    it('resets the registration form and redirects to login page after user registration', inject(function () {
      $httpBackend.whenPOST('/api/Users/').respond(200, {data: {}})

      scope.save()
      $httpBackend.flush()

      expect(scope.user).toEqual({})
      expect(location.path()).toBe('/login')
    }))
  })
})
