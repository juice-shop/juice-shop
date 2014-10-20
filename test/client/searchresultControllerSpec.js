describe('controllers', function () {
    var scope, location, controller, $httpBackend, $sce, $modal, window;

    beforeEach(module('myApp'));
    beforeEach(inject(function($injector) {
        $httpBackend = $injector.get('$httpBackend');
        $sce = $injector.get('$sce');
        $modal = $injector.get('$modal');
    }));

    describe('SearchResultController', function () {
        beforeEach(inject(function ($rootScope, $location, $window, $controller) {
            scope = $rootScope.$new();
            location = $location;
            window = $window;
            controller = $controller('SearchResultController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
            expect(scope.showDetail).toBeDefined();
            expect(scope.addToBasket).toBeDefined();
        }));

        xit('should render user search query as trusted HTML', inject(function ($controller, $location) {
            $httpBackend.whenGET('/rest/product/search?q=<script>alert("XSS1")</script>').respond(200, {data: []});
            spyOn(location, 'search').andReturn( {q : '<script>alert("XSS1")</script>'} ); // TODO Mocking location fails
            spyOn($sce, 'trustAsHtml');

            $httpBackend.flush();

            expect(scope.searchQuery).toBeDefined();
            expect($sce.trustAsHtml).toHaveBeenCalledWith('<script>alert("XSS1")</script>');
        }));

        it('should render product descriptions as trusted HTML', inject(function ($controller, $location) {
            $httpBackend.whenGET('/rest/product/search?q=undefined').respond(200, {data: [{description: '<script>alert("XSS4")</script>'}]});
            spyOn($sce, 'trustAsHtml');

            $httpBackend.flush();

            expect($sce.trustAsHtml).toHaveBeenCalledWith('<script>alert("XSS4")</script>');
        }));

        it('should open a modal dialog with product details', inject(function ($controller) {
            spyOn($modal, 'open');

            scope.showDetail();

            expect($modal.open).toHaveBeenCalled();
        }));

        it('should add new product to basket', inject(function ($controller) {
            $httpBackend.whenGET('/rest/product/search?q=undefined').respond(200, {data: []});

            window.sessionStorage.bid = 4711;
            $httpBackend.whenGET('/rest/basket/4711').respond(200, {data: {products: []}});
            $httpBackend.whenGET('/api/Products/1').respond(200, {data: {name: 'Cherry Juice'}});
            $httpBackend.whenPOST('/api/BasketItems/').respond(200, {data: {ProductId: 1}});

            scope.addToBasket(1);
            $httpBackend.flush();

            expect(scope.confirmation).toBe('Placed Cherry Juice into basket.');
        }));

        it('should add similar product to basket', inject(function ($controller) {
            $httpBackend.whenGET('/rest/product/search?q=undefined').respond(200, {data: []});

            window.sessionStorage.bid = 4711;
            $httpBackend.whenGET('/rest/basket/4711').respond(200, {data: {products: [{id : 1}, {id : 2, name: 'Tomato Juice', basketItem: {id: 42}}]}});
            $httpBackend.whenGET('/api/BasketItems/42').respond(200, {data: {id: 42, quantity: 5}});
            $httpBackend.whenPUT('/api/BasketItems/42').respond(200, {data: {ProductId: 2}});
            $httpBackend.whenGET('/api/Products/2').respond(200, {data: {name: 'Tomato Juice'}});

            scope.addToBasket(2);
            $httpBackend.flush();

            expect(scope.confirmation).toBe('Added another Tomato Juice to basket.');
        }));

        it('should not add anything to basket on error retrieving basket', inject(function ($controller) {
            $httpBackend.whenGET('/rest/product/search?q=undefined').respond(200, {data: []});

            window.sessionStorage.bid = 815;
            $httpBackend.whenGET('/rest/basket/815').respond(500);

            scope.addToBasket();
            $httpBackend.flush();

            expect(scope.confirmation).toBeUndefined();
        }));

        it('should not add anything to basket on error retrieving existing basket item', inject(function ($controller) {
            $httpBackend.whenGET('/rest/product/search?q=undefined').respond(200, {data: []});

            window.sessionStorage.bid = 4711;
            $httpBackend.whenGET('/rest/basket/4711').respond(200, {data: {products: [{id : 1}, {id : 2, name: 'Tomato Juice', basketItem: {id: 42}}]}});
            $httpBackend.whenGET('/api/BasketItems/42').respond(500);

            scope.addToBasket(2);
            $httpBackend.flush();

            expect(scope.confirmation).toBeUndefined();

        }));

        it('should not add anything to basket on error updating basket item', inject(function ($controller) {
            $httpBackend.whenGET('/rest/product/search?q=undefined').respond(200, {data: []});

            window.sessionStorage.bid = 4711;
            $httpBackend.whenGET('/rest/basket/4711').respond(200, {data: {products: [{id : 1}, {id : 2, name: 'Tomato Juice', basketItem: {id: 42}}]}});
            $httpBackend.whenGET('/api/BasketItems/42').respond(200, {data: {id: 42, quantity: 5}});
            $httpBackend.whenPUT('/api/BasketItems/42').respond(500);

            scope.addToBasket(2);
            $httpBackend.flush();

            expect(scope.confirmation).toBeUndefined();

        }));

        it('should not add anything to basket on error retrieving product associated with basket item', inject(function ($controller) {
            $httpBackend.whenGET('/rest/product/search?q=undefined').respond(200, {data: []});

            window.sessionStorage.bid = 4711;
            $httpBackend.whenGET('/rest/basket/4711').respond(200, {data: {products: [{id : 1}, {id : 2, name: 'Tomato Juice', basketItem: {id: 42}}]}});
            $httpBackend.whenGET('/api/BasketItems/42').respond(200, {data: {id: 42, quantity: 5}});
            $httpBackend.whenPUT('/api/BasketItems/42').respond(200, {data: {ProductId: 2}});
            $httpBackend.whenGET('/api/Products/2').respond(500);

            scope.addToBasket(2);
            $httpBackend.flush();

            expect(scope.confirmation).toBeUndefined();

        }));

    });

});
