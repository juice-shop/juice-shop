describe('controllers', function () {
  var scope, controller, $httpBackend, $sce, $uibModal

  beforeEach(module('juiceShop'))
  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend')
    $httpBackend.whenGET(/\/i18n\/.*\.json/).respond(200, {})
    $httpBackend.whenGET(/views\/.*\.html/).respond(200, {})
    $sce = $injector.get('$sce')
    $uibModal = $injector.get('$uibModal')
  }))

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation()
    $httpBackend.verifyNoOutstandingRequest()
  })

  describe('UserController', function () {
    beforeEach(inject(function ($rootScope, $controller) {
      scope = $rootScope.$new()
      controller = $controller('UserController', {
        '$scope': scope
      })
    }))

    it('should be defined', inject(function () {
      $httpBackend.whenGET('/rest/user/authentication-details/').respond(200, {data: []})

      $httpBackend.flush()

      expect(controller).toBeDefined()
      expect(scope.showDetail).toBeDefined()
    }))

    it('should hold all users', inject(function () {
      $httpBackend.whenGET('/rest/user/authentication-details/').respond(200, {data: [{email: 'a@a.de'}, {email: 'b@b.de'}]})

      $httpBackend.flush()

      expect(scope.users.length).toBe(2)
      expect(scope.users[0].email).toBeDefined()
      expect(scope.users[1].email).toBeDefined()
    }))

    it('should consider user email as trusted HTML', inject(function () {
      $httpBackend.whenGET('/rest/user/authentication-details/').respond(200, {data: [{email: 'bjoern@<script>alert("XSS2")</script>.de'}]})
      spyOn($sce, 'trustAsHtml')

      $httpBackend.flush()

      expect($sce.trustAsHtml).toHaveBeenCalledWith('bjoern@<script>alert("XSS2")</script>.de')
    }))

    it('should hold nothing when no users exist', inject(function () {
      $httpBackend.whenGET('/rest/user/authentication-details/').respond(200, {data: []})

      $httpBackend.flush()

      expect(scope.users).toEqual([])
    }))

    it('should hold nothing on error from backend API', inject(function () {
      $httpBackend.whenGET('/rest/user/authentication-details/').respond(500)

      $httpBackend.flush()

      expect(scope.users).toBeUndefined()
    }))

    it('should log errors directly to browser console', inject(function () {
      $httpBackend.whenGET('/rest/user/authentication-details/').respond(500, 'error')
      console.log = jasmine.createSpy('log')

      $httpBackend.flush()

      expect(console.log).toHaveBeenCalledWith('error')
    }))

    it('should open a modal dialog with user details', inject(function () {
      $httpBackend.whenGET('/rest/user/authentication-details/').respond(200, {data: []})
      spyOn($uibModal, 'open')

      $httpBackend.flush()

      scope.showDetail(42)

      expect($uibModal.open).toHaveBeenCalledWith({ templateUrl: 'views/UserDetail.html', controller: 'UserDetailsController', size: jasmine.any(String), resolve: { id: jasmine.any(Function) } })
    }))

    it('should resolve to same id as passed into user details modal dialog', inject(function () {
      $httpBackend.whenGET('/rest/user/authentication-details/').respond(200, {data: []})
      spyOn($uibModal, 'open')

      $httpBackend.flush()

      scope.showDetail(42)

      expect($uibModal.open.calls.mostRecent().args[0].resolve.id()).toBe(42)
    }))
  })
})
