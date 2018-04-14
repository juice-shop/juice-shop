describe('controllers', function () {
  var scope, location, controller, $httpBackend

  beforeEach(module('juiceShop'))
  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend')
    $httpBackend.whenGET(/\/i18n\/.*\.json/).respond(200, {})
    $httpBackend.whenGET(/views\/.*\.html/).respond(200, {})
    $httpBackend.whenGET('/api/SecurityQuestions/').respond(200, {})
  }))

  afterEach(function () {
    // $httpBackend.verifyNoOutstandingExpectation()
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
      $httpBackend.whenPOST('/api/SecurityAnswers/').respond(200, {data: {}})

      scope.user = {securityQuestion: {}}
      scope.save()
      $httpBackend.flush()

      expect(scope.user).toEqual({})
      expect(location.path()).toBe('/login')
    }))

    describe('loading secret questions', function () {
      it('should hold existing secret questions', inject(function () {
        $httpBackend.expectGET('/api/SecurityQuestions/').respond(200, { data: [ { question: 'WTF?' }, { question: 'WAT?' } ] })

        $httpBackend.flush()

        expect(scope.securityQuestions.length).toBe(2)
        expect(scope.securityQuestions[ 0 ].question).toBeDefined()
        expect(scope.securityQuestions[ 1 ].question).toBeDefined()
      }))

      it('should hold nothing when no secret questions exists', inject(function () {
        $httpBackend.flush()

        expect(scope.securityQuestions).toBeUndefined()
      }))

      it('should hold nothing on error from backend API', inject(function () {
        $httpBackend.expectGET('/api/SecurityQuestions/').respond(500)

        $httpBackend.flush()

        expect(scope.securityQuestions).toBeUndefined()
      }))

      it('should log secret question retrieval errors directly to browser console', inject(function () {
        $httpBackend.expectGET('/api/SecurityQuestions/').respond(500, 'error')
        console.log = jasmine.createSpy('log')

        $httpBackend.flush()

        expect(console.log).toHaveBeenCalledWith('error')
      }))
    })
  })
})
