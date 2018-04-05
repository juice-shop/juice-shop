describe('controllers', function () {
  var scope, controller, $httpBackend, $sce, $uibModal, window

  beforeEach(module('juiceShop'))
  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend')
    $httpBackend.whenGET(/\/i18n\/.*\.json/).respond(200, {})
    $httpBackend.whenGET(/views\/.*\.html/).respond(200, {})
    $sce = $injector.get('$sce')
    $uibModal = $injector.get('$uibModal')
  }))

  afterEach(function () {
    // $httpBackend.verifyNoOutstandingExpectation()
    // $httpBackend.verifyNoOutstandingRequest()
  })

  describe('SearchResultController', function () {
    beforeEach(inject(function ($rootScope, $window, $controller) {
      scope = $rootScope.$new()
      window = $window
      controller = $controller('SearchResultController', {
        '$scope': scope
      })
    }))

    it('should be defined', inject(function () {
      $httpBackend.whenGET('/rest/product/search?q=undefined').respond(200, {data: []})

      $httpBackend.flush()

      expect(controller).toBeDefined()
      expect(scope.showDetail).toBeDefined()
      expect(scope.addToBasket).toBeDefined()
    }))

    it('should render product descriptions as trusted HTML', inject(function () {
      $httpBackend.whenGET('/rest/product/search?q=undefined').respond(200, {data: [{description: '<script>alert("XSS")</script>'}]})
      spyOn($sce, 'trustAsHtml')

      $httpBackend.flush()

      expect($sce.trustAsHtml).toHaveBeenCalledWith('<script>alert("XSS")</script>')
    }))

    it('should hold no products when product search API call fails', inject(function () {
      $httpBackend.whenGET('/rest/product/search?q=undefined').respond(500)

      $httpBackend.flush()

      expect(scope.Products).toBeUndefined()
    }))

    it('should log error from product search API call directly to browser console', inject(function () {
      $httpBackend.whenGET('/rest/product/search?q=undefined').respond(500, 'error')

      console.log = jasmine.createSpy('log')

      $httpBackend.flush()

      expect(console.log).toHaveBeenCalledWith('error')
    }))

    it('should open a modal dialog with product details', inject(function () {
      $httpBackend.whenGET('/rest/product/search?q=undefined').respond(200, {data: []})
      spyOn($uibModal, 'open')

      $httpBackend.flush()

      scope.showDetail(42)

      expect($uibModal.open).toHaveBeenCalledWith({ templateUrl: 'views/ProductDetail.html', controller: 'ProductDetailsController', size: jasmine.any(String), resolve: { id: jasmine.any(Function) } })
    }))

    it('should resolve to same id as passed into product details modal dialog', inject(function () {
      $httpBackend.whenGET('/rest/product/search?q=undefined').respond(200, {data: []})
      spyOn($uibModal, 'open')

      $httpBackend.flush()

      scope.showDetail(42)

      expect($uibModal.open.calls.mostRecent().args[0].resolve.id()).toBe(42)
    }))

    it('should add new product to basket', inject(function () {
      $httpBackend.whenGET('/rest/product/search?q=undefined').respond(200, {data: []})

      window.sessionStorage.bid = 4711
      $httpBackend.whenGET('/rest/basket/4711').respond(200, {data: {Products: []}})
      $httpBackend.whenPOST('/api/BasketItems/').respond(200, {data: {ProductId: 1}})
      $httpBackend.whenGET(/\/api\/Products\/1/).respond(200, {data: {name: 'Cherry Juice'}})

      scope.addToBasket(1)
      $httpBackend.flush()

      expect(scope.confirmation).toBe('BASKET_ADD_PRODUCT')
    }))

    it('should translate BASKET_ADD_PRODUCT message', inject(function () {
      $httpBackend.expectGET(/\/i18n\/.*\.json/).respond(200, {'BASKET_ADD_PRODUCT': 'Translation of BASKET_ADD_PRODUCT'})
      $httpBackend.whenGET('/rest/product/search?q=undefined').respond(200, {data: []})

      window.sessionStorage.bid = 4711
      $httpBackend.whenGET('/rest/basket/4711').respond(200, {data: {Products: []}})
      $httpBackend.whenPOST('/api/BasketItems/').respond(200, {data: {ProductId: 1}})
      $httpBackend.whenGET(/\/api\/Products\/1/).respond(200, {data: {name: 'Cherry Juice'}})

      scope.addToBasket(1)
      $httpBackend.flush()

      expect(scope.confirmation).toBe('Translation of BASKET_ADD_PRODUCT')
    }))

    it('should add similar product to basket', inject(function () {
      $httpBackend.whenGET('/rest/product/search?q=undefined').respond(200, {data: []})

      window.sessionStorage.bid = 4711
      $httpBackend.whenGET('/rest/basket/4711').respond(200, {data: {Products: [{id: 1}, {id: 2, name: 'Tomato Juice', BasketItem: {id: 42}}]}})
      $httpBackend.whenGET('/api/BasketItems/42').respond(200, {data: {id: 42, quantity: 5}})
      $httpBackend.whenPUT('/api/BasketItems/42').respond(200, {data: {ProductId: 2}})
      $httpBackend.whenGET(/\/api\/Products\/2/).respond(200, {data: {name: 'Tomato Juice'}})

      scope.addToBasket(2)
      $httpBackend.flush()

      expect(scope.confirmation).toBe('BASKET_ADD_SAME_PRODUCT')
    }))

    it('should translate BASKET_ADD_SAME_PRODUCT message', inject(function () {
      $httpBackend.expectGET(/\/i18n\/.*\.json/).respond(200, {'BASKET_ADD_SAME_PRODUCT': 'Translation of BASKET_ADD_SAME_PRODUCT'})
      $httpBackend.whenGET('/rest/product/search?q=undefined').respond(200, {data: []})

      window.sessionStorage.bid = 4711
      $httpBackend.whenGET('/rest/basket/4711').respond(200, {data: {Products: [{id: 1}, {id: 2, name: 'Tomato Juice', BasketItem: {id: 42}}]}})
      $httpBackend.whenGET('/api/BasketItems/42').respond(200, {data: {id: 42, quantity: 5}})
      $httpBackend.whenPUT('/api/BasketItems/42').respond(200, {data: {ProductId: 2}})
      $httpBackend.whenGET(/\/api\/Products\/2/).respond(200, {data: {name: 'Tomato Juice'}})

      scope.addToBasket(2)
      $httpBackend.flush()

      expect(scope.confirmation).toBe('Translation of BASKET_ADD_SAME_PRODUCT')
    }))

    it('should not add anything to basket on error retrieving basket', inject(function () {
      $httpBackend.whenGET('/rest/product/search?q=undefined').respond(200, {data: []})

      window.sessionStorage.bid = 815
      $httpBackend.whenGET('/rest/basket/815').respond(500)

      scope.addToBasket()
      $httpBackend.flush()

      expect(scope.confirmation).toBeUndefined()
    }))

    it('should log errors retrieving basket directly to browser console', inject(function () {
      $httpBackend.whenGET('/rest/product/search?q=undefined').respond(200, {data: []})

      window.sessionStorage.bid = 815
      $httpBackend.whenGET('/rest/basket/815').respond(500, 'error')

      console.log = jasmine.createSpy('log')

      scope.addToBasket(2)
      $httpBackend.flush()

      expect(console.log).toHaveBeenCalledWith('error')
    }))

    it('should not add anything to basket on error retrieving existing basket item', inject(function () {
      $httpBackend.whenGET('/rest/product/search?q=undefined').respond(200, {data: []})

      window.sessionStorage.bid = 4711
      $httpBackend.whenGET('/rest/basket/4711').respond(200, {data: {Products: [{id: 1}, {id: 2, name: 'Tomato Juice', BasketItem: {id: 42}}]}})
      $httpBackend.whenGET('/api/BasketItems/42').respond(500)

      scope.addToBasket(2)
      $httpBackend.flush()

      expect(scope.confirmation).toBeUndefined()
    }))

    it('should log errors retrieving basket item directly to browser console', inject(function () {
      $httpBackend.whenGET('/rest/product/search?q=undefined').respond(200, {data: []})

      window.sessionStorage.bid = 4711
      $httpBackend.whenGET('/rest/basket/4711').respond(200, {data: {Products: [{id: 1}, {id: 2, name: 'Tomato Juice', BasketItem: {id: 42}}]}})
      $httpBackend.whenGET('/api/BasketItems/42').respond(500, 'error')

      console.log = jasmine.createSpy('log')

      scope.addToBasket(2)
      $httpBackend.flush()

      expect(console.log).toHaveBeenCalledWith('error')
    }))

    it('should not add anything to basket on error updating basket item', inject(function () {
      $httpBackend.whenGET('/rest/product/search?q=undefined').respond(200, {data: []})

      window.sessionStorage.bid = 4711
      $httpBackend.whenGET('/rest/basket/4711').respond(200, {data: {Products: [{id: 1}, {id: 2, name: 'Tomato Juice', BasketItem: {id: 42}}]}})
      $httpBackend.whenGET('/api/BasketItems/42').respond(200, {data: {id: 42, quantity: 5}})
      $httpBackend.whenPUT('/api/BasketItems/42').respond(500)

      scope.addToBasket(2)
      $httpBackend.flush()

      expect(scope.confirmation).toBeUndefined()
    }))

    it('should log errors updating basket directly to browser console', inject(function () {
      $httpBackend.whenGET('/rest/product/search?q=undefined').respond(200, {data: []})

      window.sessionStorage.bid = 4711
      $httpBackend.whenGET('/rest/basket/4711').respond(200, {data: {Products: [{id: 1}, {id: 2, name: 'Tomato Juice', BasketItem: {id: 42}}]}})
      $httpBackend.whenGET('/api/BasketItems/42').respond(200, {data: {id: 42, quantity: 5}})
      $httpBackend.whenPUT('/api/BasketItems/42').respond(500, 'error')

      console.log = jasmine.createSpy('log')

      scope.addToBasket(2)
      $httpBackend.flush()

      expect(console.log).toHaveBeenCalledWith('error')
    }))

    it('should not add anything to basket on error retrieving product associated with basket item', inject(function () {
      $httpBackend.whenGET('/rest/product/search?q=undefined').respond(200, {data: []})

      window.sessionStorage.bid = 4711
      $httpBackend.whenGET('/rest/basket/4711').respond(200, {data: {Products: [{id: 1}, {id: 2, name: 'Tomato Juice', BasketItem: {id: 42}}]}})
      $httpBackend.whenGET('/api/BasketItems/42').respond(200, {data: {id: 42, quantity: 5}})
      $httpBackend.whenPUT('/api/BasketItems/42').respond(200, {data: {ProductId: 2}})
      $httpBackend.whenGET(/\/api\/Products\/2/).respond(500)

      scope.addToBasket(2)
      $httpBackend.flush()

      expect(scope.confirmation).toBeUndefined()
    }))

    it('should log errors retrieving product associated with basket item directly to browser console', inject(function () {
      $httpBackend.whenGET('/rest/product/search?q=undefined').respond(200, {data: []})

      window.sessionStorage.bid = 4711
      $httpBackend.whenGET('/rest/basket/4711').respond(200, {data: {Products: [{id: 1}, {id: 2, name: 'Tomato Juice', BasketItem: {id: 42}}]}})
      $httpBackend.whenGET('/api/BasketItems/42').respond(200, {data: {id: 42, quantity: 5}})
      $httpBackend.whenPUT('/api/BasketItems/42').respond(200, {data: {ProductId: 2}})
      $httpBackend.whenGET(/\/api\/Products\/2/).respond(500, 'error')

      console.log = jasmine.createSpy('log')

      scope.addToBasket(2)
      $httpBackend.flush()

      expect(console.log).toHaveBeenCalledWith('error')
    }))

    it('should not add anything on error creating new basket item', inject(function () {
      $httpBackend.whenGET('/rest/product/search?q=undefined').respond(200, {data: []})

      window.sessionStorage.bid = 4711
      $httpBackend.whenGET('/rest/basket/4711').respond(200, {data: {Products: []}})
      $httpBackend.whenPOST('/api/BasketItems/').respond(500)

      scope.addToBasket(1)
      $httpBackend.flush()

      expect(scope.confirmation).toBeUndefined()
    }))

    it('should log errors creating new basket item directly to browser console', inject(function () {
      $httpBackend.whenGET('/rest/product/search?q=undefined').respond(200, {data: []})

      window.sessionStorage.bid = 4711
      $httpBackend.whenGET('/rest/basket/4711').respond(200, {data: {Products: []}})
      $httpBackend.whenPOST('/api/BasketItems/').respond(500, 'error')

      console.log = jasmine.createSpy('log')

      scope.addToBasket(1)
      $httpBackend.flush()

      expect(console.log).toHaveBeenCalledWith('error')
    }))

    it('should not add anything on error retrieving product after creating new basket item', inject(function () {
      $httpBackend.whenGET('/rest/product/search?q=undefined').respond(200, {data: []})

      window.sessionStorage.bid = 4711
      $httpBackend.whenGET('/rest/basket/4711').respond(200, {data: {Products: []}})
      $httpBackend.whenPOST('/api/BasketItems/').respond(200, {data: {ProductId: 1}})
      $httpBackend.whenGET(/\/api\/Products\/1/).respond(500)

      scope.addToBasket(1)
      $httpBackend.flush()

      expect(scope.confirmation).toBeUndefined()
    }))

    it('should log errors retrieving product after creating new basket item directly to browser console', inject(function () {
      $httpBackend.whenGET('/rest/product/search?q=undefined').respond(200, {data: []})

      window.sessionStorage.bid = 4711
      $httpBackend.whenGET('/rest/basket/4711').respond(200, {data: {Products: []}})
      $httpBackend.whenPOST('/api/BasketItems/').respond(200, {data: {ProductId: 1}})
      $httpBackend.whenGET(/\/api\/Products\/1/).respond(500, 'error')

      console.log = jasmine.createSpy('log')

      scope.addToBasket(1)
      $httpBackend.flush()

      expect(console.log).toHaveBeenCalledWith('error')
    }))
  })
})
