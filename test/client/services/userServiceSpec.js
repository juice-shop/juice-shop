describe('services', function () {
  var $httpBackend, result

  beforeEach(module('juiceShop'))
  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend')
    $httpBackend.whenGET(/\/i18n\/.*\.json/).respond(200, {})
    $httpBackend.whenGET(/views\/.*\.html/).respond(200, {})
    result = undefined
  }))

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation()
  })

  describe('UserService', function () {
    it('should be defined', inject(function (UserService) {
      expect(UserService).toBeDefined()
      expect(UserService.find).toBeDefined()
      expect(UserService.get).toBeDefined()
      expect(UserService.changePassword).toBeDefined()
      expect(UserService.whoAmI).toBeDefined()
    }))

    it('should get all users directly from the rest api', inject(function (UserService) {
      $httpBackend.whenGET('/rest/user/authentication-details/').respond(200, {data: 'apiResponse'})

      UserService.find().then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should get single users directly from the rest api', inject(function (UserService) {
      $httpBackend.whenGET('/api/Users/1').respond(200, {data: 'apiResponse'})

      UserService.get(1).then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should create user directly via the rest api', inject(function (UserService) {
      $httpBackend.whenPOST('/api/Users/').respond(200, {data: 'apiResponse'})

      UserService.save().then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should login user directly via the rest api', inject(function (UserService) {
      $httpBackend.whenPOST('/rest/user/login').respond(200, {authentication: 'apiResponse'})

      UserService.login().then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should change user password directly via the rest api', inject(function (UserService) {
      $httpBackend.whenGET('/rest/user/change-password?current=foo&new=bar&repeat=bar').respond(200, {user: 'apiResponse'})

      UserService.changePassword({current: 'foo', new: 'bar', repeat: 'bar'}).then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should return the logged-in users identity directly from the rest api', inject(function (UserService) {
      $httpBackend.whenGET('/rest/user/whoami').respond(200, {user: 'apiResponse'})

      UserService.whoAmI().then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))
  })
})
