describe('controllers', function () {
    var scope, controller, $httpBackend, $sce;

    beforeEach(module('juiceShop'));
    beforeEach(inject(function($injector) {
        $httpBackend = $injector.get('$httpBackend');
        $sce = $injector.get('$sce');
    }));

    describe('ProductDetailsController', function () {
        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            controller = $controller('ProductDetailsController', {
                '$scope': scope,
                'id': 42
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
        }));

        it('should hold single product with given id', inject(function ($controller) {
            $httpBackend.whenGET(/\/api\/Products\/42/).respond(200, {data: {name: 'Test Juice'}});

            $httpBackend.flush();

            expect(scope.product).toBeDefined();
            expect(scope.product.name).toBe('Test Juice');
        }));

        it('should render product description as trusted HTML', inject(function ($controller) {
            $httpBackend.whenGET(/\/api\/Products\/42/).respond(200, {data: {description: '<script>alert("XSS4")</script>'}});
            spyOn($sce, 'trustAsHtml');

            $httpBackend.flush();

            expect($sce.trustAsHtml).toHaveBeenCalledWith('<script>alert("XSS4")</script>');
        }));

        it('should hold no product if API call fails', inject(function ($controller) {
            $httpBackend.whenGET(/\/api\/Products\/42/).respond(500);

            $httpBackend.flush();

            expect(scope.product).toBeUndefined();
        }));

    });

});
