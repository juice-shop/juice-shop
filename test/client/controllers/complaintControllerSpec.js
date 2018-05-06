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
    $httpBackend.verifyNoOutstandingRequest()
  })

  describe('ComplaintController', function () {
    beforeEach(inject(function ($rootScope, $controller) {
      scope = $rootScope.$new()
      controller = $controller('ComplaintController', {
        '$scope': scope
      })
    }))

    it('should be defined', inject(function () {
      $httpBackend.whenGET('/rest/user/whoami').respond(200, {user: {}})

      $httpBackend.flush()

      expect(controller).toBeDefined()
      expect(scope.save).toBeDefined()
    }))

    it('should miss complaint object if retrieving currently logged in user fails', inject(function () {
      $httpBackend.whenGET('/rest/user/whoami').respond(500)

      $httpBackend.flush()

      expect(scope.complaint).toBeUndefined()
    }))

    it('should hold the user email of the currently logged in user', inject(function () {
      $httpBackend.whenGET('/rest/user/whoami').respond(200, {user: {email: 'x@x.xx'}})

      $httpBackend.flush()

      expect(scope.userEmail).toBe('x@x.xx')
    }))

    it('should hold no email if current user is not logged in', inject(function () {
      $httpBackend.whenGET('/rest/user/whoami').respond(200, {user: {}})

      $httpBackend.flush()

      expect(scope.userEmail).toBeUndefined()
    }))

    it('should display support message with #id and reset complaint form on saving complaint', inject(function () {
      $httpBackend.whenGET('/rest/user/whoami').respond(200, {user: {}})

      $httpBackend.whenPOST('/api/Complaints/').respond(200, {data: {id: '42'}})
      scope.complaint = {id: '42', message: 'Test'}
      scope.form = {$setPristine: function () {}}

      scope.save()
      $httpBackend.flush()

      expect(scope.complaint).toEqual({UserId: undefined})
      expect(scope.confirmation).toBe('Customer support will get in touch with you soon! Your complaint reference is #42')
    }))

    it('should display support message with #id and reset complaint form on saving complaint even if file upload failed in the background', inject(function () {
      $httpBackend.whenGET('/rest/user/whoami').respond(200, {user: {}})

      $httpBackend.whenPOST('/file-upload').respond(500)
      scope.file = {}

      $httpBackend.whenPOST('/api/Complaints/').respond(200, {data: {id: '66'}})
      scope.complaint = {id: '66', message: 'Test'}
      scope.form = {$setPristine: function () {}}

      scope.save()
      $httpBackend.flush()

      expect(scope.complaint).toEqual({UserId: undefined})
      expect(scope.confirmation).toBe('Customer support will get in touch with you soon! Your complaint reference is #66')
    }))

    it('should save complaint after sending file to backend for processing', function () {
      $httpBackend.whenGET('/rest/user/whoami').respond(200, {user: {}})
      $httpBackend.expectPOST('/file-upload').respond(204)
      $httpBackend.expectPOST('/api/Complaints/').respond(200, {data: {id: '66'}})
      scope.form = {$setPristine: function () {}}

      var file = {}
      scope.upload(file)
      $httpBackend.flush()
    })

    it('should save complaint even after failed file upload', function () {
      $httpBackend.whenGET('/rest/user/whoami').respond(200, {user: {}})
      $httpBackend.expectPOST('/file-upload').respond(500)
      $httpBackend.expectPOST('/api/Complaints/').respond(200, {data: {id: '66'}})
      scope.form = {$setPristine: function () {}}

      var file = {}
      scope.upload(file)
      $httpBackend.flush()
    })

    it('should log status of error while uploading file directly to browser console', inject(function () {
      $httpBackend.whenGET('/rest/user/whoami').respond(200, {user: {}})
      $httpBackend.expectPOST('/file-upload').respond(500)
      $httpBackend.expectPOST('/api/Complaints/').respond(200, {data: {id: '66'}})
      scope.form = {$setPristine: function () {}}

      console.log = jasmine.createSpy('log')

      var file = {}
      scope.upload(file)
      $httpBackend.flush()

      expect(console.log).toHaveBeenCalledWith('Error status: 500')
    }))

    xit('should trigger upload before saving complaint when a file is selected', function () {
      $httpBackend.whenGET('/rest/user/whoami').respond(200, {user: {}})
      $httpBackend.expectPOST('/file-upload').respond(204)
      $httpBackend.expectPOST('/api/Complaints/').respond(200, {data: {id: '66', file: 'file.pdf'}})
      scope.form = {$setPristine: function () {}}

      scope.file = new File([''], 'file.pdf', {'size': 1000, 'type': 'application/pdf'})
      scope.save()
      $httpBackend.flush()

      expect(scope.complaint.file).toBe('file.pdf')
    })

    xit('should 100% progress after upload', function () {
      $httpBackend.whenGET('/rest/user/whoami').respond(200, {user: {}})
      $httpBackend.whenPOST('/file-upload').respond(204)
      $httpBackend.whenPOST('/api/Complaints/').respond(200, {data: {id: '66'}})
      scope.form = {$setPristine: function () {}}

      var file = new File([''], 'file.pdf', {'size': 1000, 'type': 'application/pdf'})
      scope.upload(file)
      $httpBackend.flush()

      expect(scope.progress).toBe('Progress: 100%')
    })
  })
})
