describe('controllers', function () {
  var scope, controller, $httpBackend

  beforeEach(module('juiceShop'))
  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend')
    $httpBackend.whenGET(/\/i18n\/.*\.json/).respond(200, {})
    $httpBackend.whenGET(/views\/.*\.html/).respond(200, {})
    $httpBackend.whenGET('/rest/user/whoami').respond(200, {user: {}})
    $httpBackend.whenGET('/rest/admin/application-configuration').respond(200, {})
  }))

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation()
    $httpBackend.verifyNoOutstandingRequest()
  })

  describe('RecycleController', function () {
    beforeEach(inject(function ($rootScope, $controller) {
      scope = $rootScope.$new()
      controller = $controller('RecycleController', {
        '$scope': scope
      })
    }))

    it('should be defined', inject(function () {
      $httpBackend.whenGET('/api/Recycles/').respond(200, {data: []})

      $httpBackend.flush()

      expect(controller).toBeDefined()
    }))

    it('should hold the user id of the currently logged in user', inject(function () {
      $httpBackend.expectGET('/rest/user/whoami').respond(200, {user: {id: 42}})
      $httpBackend.whenGET('/api/Recycles/').respond(200, {data: []})

      $httpBackend.flush()

      expect(scope.recycle.UserId).toBe(42)
    }))

    it('should hold no email if current user is not logged in', inject(function () {
      $httpBackend.whenGET('/api/Recycles/').respond(200, {data: []})

      $httpBackend.flush()

      expect(scope.userEmail).toBeUndefined()
    }))

    it('should hold the user email of the currently logged in user', inject(function () {
      $httpBackend.expectGET('/rest/user/whoami').respond(200, {user: {email: 'x@x.xx'}})
      $httpBackend.whenGET('/api/Recycles/').respond(200, {data: []})

      $httpBackend.flush()

      expect(scope.userEmail).toBe('x@x.xx')
    }))

    it('should display pickup message and reset recycle form on saving', inject(function () {
      $httpBackend.whenGET('/api/Recycles/').respond(200, {data: []})

      $httpBackend.whenPOST('/api/Recycles/').respond(200, {data: {isPickup: true, pickupDate: '2017-05-23'}})
      scope.recycle = {isPickup: true, pickupDate: '2017-05-23'}
      scope.form = {$setPristine: function () {}}

      scope.save()
      $httpBackend.flush()

      expect(scope.recycle).toEqual({UserId: undefined})
      expect(scope.confirmation).toBe('Thank you for using our recycling service. We will pick up your pomace on 2017-05-23.')
    }))

    it('should display box delivery message and reset recycle form on saving', inject(function () {
      $httpBackend.whenGET('/api/Recycles/').respond(200, {data: []})

      $httpBackend.whenPOST('/api/Recycles/').respond(200, {data: {isPickup: false}})
      scope.recycle = {isPickup: false}
      scope.form = {$setPristine: function () {}}

      scope.save()
      $httpBackend.flush()

      expect(scope.recycle).toEqual({UserId: undefined})
      expect(scope.confirmation).toBe('Thank you for using our recycling service. We will deliver your recycle box asap.')
    }))

    it('should hold existing recycles', inject(function () {
      $httpBackend.whenGET('/api/Recycles/').respond(200, {data: [{quantity: 1}, {quantity: 2}]})

      $httpBackend.flush()

      expect(scope.recycles.length).toBe(2)
      expect(scope.recycles[0].quantity).toBeDefined()
      expect(scope.recycles[1].quantity).toBeDefined()
    }))

    it('should hold nothing when no recycles exists', inject(function () {
      $httpBackend.whenGET('/api/Recycles/').respond(200, {data: {}})

      $httpBackend.flush()

      expect(scope.recycles).toEqual({})
    }))

    it('should hold nothing on error from backend API', inject(function () {
      $httpBackend.whenGET('/api/Recycles/').respond(500)

      $httpBackend.flush()

      expect(scope.recycles).toBeUndefined()
    }))

    it('should log error from backend API directly to browser console', inject(function () {
      $httpBackend.whenGET('/api/Recycles/').respond(500, 'error')

      console.log = jasmine.createSpy('log')

      $httpBackend.flush()

      expect(console.log).toHaveBeenCalledWith('error')
    }))

    it('should use a configured product image on top of page', inject(function () {
      $httpBackend.whenGET('/api/Recycles/').respond(200, {data: []})
      $httpBackend.expectGET('/rest/admin/application-configuration').respond(200, {config: {application: {recyclePage: {topProductImage: 'top.png'}}}})

      $httpBackend.flush()

      expect(scope.topImage).toEqual('/public/images/products/top.png')
    }))

    it('should use a configured product image on bottom of page', inject(function () {
      $httpBackend.whenGET('/api/Recycles/').respond(200, {data: []})
      $httpBackend.expectGET('/rest/admin/application-configuration').respond(200, {config: {application: {recyclePage: {bottomProductImage: 'bottom.png'}}}})

      $httpBackend.flush()

      expect(scope.bottomImage).toEqual('/public/images/products/bottom.png')
    }))

    it('should show broken top and bottom image on error retrieving configuration', inject(function () {
      $httpBackend.whenGET('/api/Recycles/').respond(200, {data: []})
      $httpBackend.whenGET('/rest/admin/application-configuration').respond(500)

      $httpBackend.flush()

      expect(scope.topImage).toBeUndefined()
      expect(scope.bottomImage).toBeUndefined()
    }))
  })
})
