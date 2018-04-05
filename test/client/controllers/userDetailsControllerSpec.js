describe('controllers', function () {
  var scope, controller, $httpBackend

  beforeEach(module('juiceShop'))
  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend')
    $httpBackend.whenGET(/\/i18n\/.*\.json/).respond(200, {})
    $httpBackend.whenGET(/views\/.*\.html/).respond(200, {})
  }))

  afterEach(function () {
    // $httpBackend.verifyNoOutstandingExpectation()
    // $httpBackend.verifyNoOutstandingRequest()
  })

  describe('UserDetailsController', function () {
    beforeEach(inject(function ($rootScope, $controller) {
      scope = $rootScope.$new()
      controller = $controller('UserDetailsController', {
        '$scope': scope,
        'id': 42
      })
    }))

    it('should be defined', inject(function () {
      $httpBackend.whenGET('/api/Users/42').respond(200, {data: {}})

      $httpBackend.flush()

      expect(controller).toBeDefined()
    }))

    it('should hold single product with given id', inject(function () {
      $httpBackend.whenGET('/api/Users/42').respond(200, {data: {email: 'test@juice-sh.op'}})

      $httpBackend.flush()

      expect(scope.user).toBeDefined()
      expect(scope.user.email).toBe('test@juice-sh.op')
    }))

    it('should hold no product if API call fails', inject(function () {
      $httpBackend.whenGET('/api/Users/42').respond(500)

      $httpBackend.flush()

      expect(scope.user).toBeUndefined()
    }))

    it('should log errors directly to browser console', inject(function () {
      $httpBackend.whenGET('/api/Users/42').respond(500, 'error')
      console.log = jasmine.createSpy('log')

      $httpBackend.flush()

      expect(console.log).toHaveBeenCalledWith('error')
    }))
  })
})
