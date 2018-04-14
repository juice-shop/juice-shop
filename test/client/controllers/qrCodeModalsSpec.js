describe('controllers', function () {
  var scope, $window, $httpBackend, $uibModal

  beforeEach(module('juiceShop'))
  beforeEach(function () {
    $window = {location: {replace: jasmine.createSpy()}, sessionStorage: {bid: 42}, localStorage: {}}

    module(function ($provide) {
      $provide.value('$window', $window)
    })
  })
  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend')
    $httpBackend.whenGET(/\/i18n\/.*\.json/).respond(200, {})
    $httpBackend.whenGET(/views\/.*\.html/).respond(200, {})
    $httpBackend.whenGET('/rest/admin/application-configuration').respond(200, {config: {}})
    $httpBackend.whenGET('/rest/user/whoami').respond(200, {user: {}})
    $uibModal = $injector.get('$uibModal')
  }))

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation()
    $httpBackend.verifyNoOutstandingRequest()
  })

  describe('BasketController', function () {
    beforeEach(inject(function ($rootScope, $window, $controller) {
      scope = $rootScope.$new()
      $controller('BasketController', {
        '$scope': scope
      })
    }))

    it('should open a modal dialog with a Bitcoin QR code', inject(function () {
      $httpBackend.whenGET('/rest/basket/42').respond(200, {data: {Products: []}})
      spyOn($uibModal, 'open')

      $httpBackend.flush()

      scope.showBitcoinQrCode()

      expect($uibModal.open).toHaveBeenCalledWith({templateUrl: 'views/QrCode.html', controller: 'QrCodeController', size: 'md', resolve: { data: jasmine.any(Function), url: jasmine.any(Function), address: jasmine.any(Function), title: jasmine.any(Function) }})
      expect($uibModal.open.calls.mostRecent().args[0].resolve.data()).toMatch(/bitcoin:.*/)
      expect($uibModal.open.calls.mostRecent().args[0].resolve.url()).toMatch(/\/redirect\?to=https:\/\/blockchain\.info\/address\/.*/)
      expect($uibModal.open.calls.mostRecent().args[0].resolve.title()).toBe('TITLE_BITCOIN_ADDRESS')
      expect($uibModal.open.calls.mostRecent().args[0].resolve.address()).toBeDefined()
    }))

    it('should open a modal dialog with a Dash QR code', inject(function () {
      $httpBackend.whenGET('/rest/basket/42').respond(200, {data: {Products: []}})
      spyOn($uibModal, 'open')

      $httpBackend.flush()

      scope.showDashQrCode()

      expect($uibModal.open).toHaveBeenCalledWith({templateUrl: 'views/QrCode.html', controller: 'QrCodeController', size: 'md', resolve: { data: jasmine.any(Function), url: jasmine.any(Function), address: jasmine.any(Function), title: jasmine.any(Function) }})
      expect($uibModal.open.calls.mostRecent().args[0].resolve.data()).toMatch(/dash:.*/)
      expect($uibModal.open.calls.mostRecent().args[0].resolve.url()).toMatch(/\/redirect\?to=https:\/\/explorer\.dash\.org\/address\/.*/)
      expect($uibModal.open.calls.mostRecent().args[0].resolve.title()).toBe('TITLE_DASH_ADDRESS')
      expect($uibModal.open.calls.mostRecent().args[0].resolve.address()).toBeDefined()
    }))

    it('should open a modal dialog with an Ether QR code', inject(function () {
      $httpBackend.whenGET('/rest/basket/42').respond(200, {data: {Products: []}})
      spyOn($uibModal, 'open')

      $httpBackend.flush()

      scope.showEtherQrCode()

      expect($uibModal.open).toHaveBeenCalledWith({templateUrl: 'views/QrCode.html', controller: 'QrCodeController', size: 'md', resolve: { data: jasmine.any(Function), url: jasmine.any(Function), address: jasmine.any(Function), title: jasmine.any(Function) }})
      expect($uibModal.open.calls.mostRecent().args[0].resolve.data()).toMatch(/0x.*/)
      expect($uibModal.open.calls.mostRecent().args[0].resolve.url()).toMatch(/https:\/\/etherscan\.io\/address\/.*/)
      expect($uibModal.open.calls.mostRecent().args[0].resolve.title()).toBe('TITLE_ETHER_ADDRESS')
      expect($uibModal.open.calls.mostRecent().args[0].resolve.address()).toBeDefined()
    }))
  })
})
