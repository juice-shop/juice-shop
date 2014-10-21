describe('controllers', function () {
    var scope, controller, window, $httpBackend;

    beforeEach(module('myApp'));
    beforeEach(inject(function($injector) {
        $httpBackend = $injector.get('$httpBackend');
    }));

    describe('BasketController', function () {
        beforeEach(inject(function ($rootScope, $window, $controller) {
            scope = $rootScope.$new();
            window = $window;
            window.sessionStorage.bid = 42;
            controller = $controller('BasketController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
            expect(scope.delete).toBeDefined();
            expect(scope.order).toBeDefined();
            expect(scope.inc).toBeDefined();
            expect(scope.dec).toBeDefined();
        }));

        it('should pass delete request for feedback to backend API', inject(function ($controller) {
            $httpBackend.whenGET('/rest/basket/42').respond(200,  {data: {products: [{basketItem: {id: 1}}]}});
            $httpBackend.whenDELETE('/api/BasketItems/1').respond(200);

            scope.delete(1);
            $httpBackend.flush();
        }));

        it('should gracefully handle error while deleting feedback', inject(function ($controller) {
            $httpBackend.whenGET('/rest/basket/42').respond(200, {data: {products: [{basketItem: {id: 1}}]}});
            $httpBackend.whenDELETE('/api/BasketItems/1').respond(500);

            scope.delete(1);
            $httpBackend.flush();
        }));
    });

});
