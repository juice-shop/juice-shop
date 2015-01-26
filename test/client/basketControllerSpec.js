describe('controllers', function () {
    var scope, controller, $window, $httpBackend;

    beforeEach(module('myApp'));

    beforeEach(function() {
        $window = {location: { replace: jasmine.createSpy()}, sessionStorage: {bid: 42} };

        module(function($provide) {
            $provide.value('$window', $window);
        });
    })

    beforeEach(inject(function($injector) {
        $httpBackend = $injector.get('$httpBackend');
    }));

    describe('BasketController', function () {
        beforeEach(inject(function ($rootScope, $window, $controller) {
            scope = $rootScope.$new();
            controller = $controller('BasketController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
            expect(scope.delete).toBeDefined();
            expect(scope.checkout).toBeDefined();
            expect(scope.applyCoupon).toBeDefined();
            expect(scope.inc).toBeDefined();
            expect(scope.dec).toBeDefined();
        }));

        it('should hold products returned by backend API', inject(function ($controller) {
            $httpBackend.whenGET('/rest/basket/42').respond(200,  {data: {products: [{description: 'a'},{description: 'b'}]}});

            $httpBackend.flush();

            expect(scope.products).toBeDefined();
            expect(scope.products.length).toBe(2);
            expect(scope.products[0].description).toBeDefined();
            expect(scope.products[1].description).toBeDefined();
        }));

        it('should hold no products when none are returned by backend API', inject(function ($controller) {
            $httpBackend.whenGET('/rest/basket/42').respond(200, {data: {products: []}});

            $httpBackend.flush();

            expect(scope.products).toEqual({});
        }));

        it('should hold no products on error in backend API', inject(function ($controller) {
            $httpBackend.whenGET('/rest/basket/42').respond(500);

            $httpBackend.flush();

            expect(scope.products).toBeUndefined();
        }));

        it('should pass delete request for basket item to backend API', inject(function ($controller) {
            $httpBackend.whenGET('/rest/basket/42').respond(200,  {data: {products: [{basketItem: {id: 1}}]}});
            $httpBackend.whenDELETE('/api/BasketItems/1').respond(200);

            scope.delete(1);
            $httpBackend.flush();
        }));

        it('should gracefully handle error while deleting basket item', inject(function ($controller) {
            $httpBackend.whenGET('/rest/basket/42').respond(200, {data: {products: [{basketItem: {id: 1}}]}});
            $httpBackend.whenDELETE('/api/BasketItems/1').respond(500);

            scope.delete(1);
            $httpBackend.flush();
        }));

        it('should redirect to confirmation URL after ordering basket', inject(function ($controller) {
            $httpBackend.whenGET('/rest/basket/42').respond(200,  {data: {products: [{basketItem: {id: 1}}]}});
            $httpBackend.whenPOST('/rest/basket/42/checkout').respond(200, 'confirmationUrl');

            scope.checkout();
            $httpBackend.flush();

            expect($window.location.replace).toHaveBeenCalledWith('confirmationUrl');
        }));

        it('should not redirect anywhere when ordering basket fails', inject(function ($controller) {
            $httpBackend.whenGET('/rest/basket/42').respond(200,  {data: {products: [{basketItem: {id: 1}}]}});
            $httpBackend.whenPOST('/rest/basket/42/checkout').respond(500);

            scope.checkout();
            $httpBackend.flush();

            expect($window.location.replace.mostRecentCall).toEqual({});
        }));

        it('should update basket item with increased quantity after adding another item of same type', inject(function ($controller) {
            $httpBackend.whenGET('/rest/basket/42').respond(200,  {data: {products: [{basketItem: {id: 1, quantity: 1}}]}});
            $httpBackend.whenGET('/api/BasketItems/1').respond(200,  {data: {id: 1, quantity: 1}});
            $httpBackend.whenPUT('/api/BasketItems/1', {quantity: 2}).respond(200);

            scope.inc(1);
            $httpBackend.flush();
        }));

        it('should not increase quantity on error retrieving basket item', inject(function ($controller) {
            $httpBackend.whenGET('/rest/basket/42').respond(200,  {data: {products: [{basketItem: {id: 1, quantity: 1}}]}});
            $httpBackend.whenGET('/api/BasketItems/1').respond(500);

            scope.inc(1);
            $httpBackend.flush();
        }));

        it('should not increase quantity on error updating basket item', inject(function ($controller) {
            $httpBackend.whenGET('/rest/basket/42').respond(200,  {data: {products: [{basketItem: {id: 1, quantity: 2}}]}});
            $httpBackend.whenGET('/api/BasketItems/1').respond(200,  {data: {id: 1, quantity: 2}});
            $httpBackend.whenPUT('/api/BasketItems/1', {quantity: 3}).respond(500);

            scope.inc(1);
            $httpBackend.flush();
        }));

        it('should update basket item with decreased quantity after removing an item', inject(function ($controller) {
            $httpBackend.whenGET('/rest/basket/42').respond(200,  {data: {products: [{basketItem: {id: 1, quantity: 5}}]}});
            $httpBackend.whenGET('/api/BasketItems/1').respond(200,  {data: {id: 1, quantity: 5}});
            $httpBackend.whenPUT('/api/BasketItems/1', {quantity: 4}).respond(200);

            scope.dec(1);
            $httpBackend.flush();
        }));

        it('should always keep one item of any product in the basket when reducing quantity via UI', inject(function ($controller) {
            $httpBackend.whenGET('/rest/basket/42').respond(200,  {data: {products: [{basketItem: {id: 1, quantity: 1}}]}});
            $httpBackend.whenGET('/api/BasketItems/1').respond(200,  {data: {id: 1, quantity: 1}});
            $httpBackend.whenPUT('/api/BasketItems/1', {quantity: 1}).respond(200);

            scope.dec(1);
            $httpBackend.flush();
        }));

        it('should not decrease quantity on error retrieving basket item', inject(function ($controller) {
            $httpBackend.whenGET('/rest/basket/42').respond(200,  {data: {products: [{basketItem: {id: 1, quantity: 1}}]}});
            $httpBackend.whenGET('/api/BasketItems/1').respond(500);

            scope.dec(1);
            $httpBackend.flush();
        }));

        it('should not decrease quantity on error updating basket item', inject(function ($controller) {
            $httpBackend.whenGET('/rest/basket/42').respond(200,  {data: {products: [{basketItem: {id: 1, quantity: 2}}]}});
            $httpBackend.whenGET('/api/BasketItems/1').respond(200,  {data: {id: 1, quantity: 2}});
            $httpBackend.whenPUT('/api/BasketItems/1', {quantity: 1}).respond(500);

            scope.dec(1);
            $httpBackend.flush();
        }));

        it('should reject an invalid coupon code', inject(function ($controller) {
            scope.form = {$setPristine : function() {}};
            $httpBackend.whenGET('/rest/basket/42').respond(200, {data: {products: []}});
            $httpBackend.whenPUT('/rest/basket/42/coupon/invalid_base85').respond(404, 'error');

            scope.coupon = 'invalid_base85';
            scope.applyCoupon();
            $httpBackend.flush();

            expect(scope.confirmation).toBeUndefined();
            expect(scope.error).toBe('error');
        }));

        it('should accept a valid coupon code', inject(function ($controller) {
            scope.form = {$setPristine : function() {}};
            $httpBackend.whenGET('/rest/basket/42').respond(200, {data: {products: []}});
            $httpBackend.whenPUT('/rest/basket/42/coupon/valid_base85').respond(200, { discount: 42 });

            scope.coupon = 'valid_base85';
            scope.applyCoupon();
            $httpBackend.flush();

            expect(scope.confirmation).toBe('Discount of 42% will be applied during checkout.');
            expect(scope.error).toBeUndefined();
        }));

    });

});
