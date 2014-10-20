describe('controllers', function () {
    var scope, location, controller, $httpBackend, $sce, $modal;

    beforeEach(module('myApp'));
    beforeEach(inject(function($injector) {
        $httpBackend = $injector.get('$httpBackend');
        $sce = $injector.get('$sce');
        $modal = $injector.get('$modal');
    }));

    describe('SearchResultController', function () {
        beforeEach(inject(function ($rootScope, $location, $controller) {
            scope = $rootScope.$new();
            location = $location;
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

            scope.showDetail(42);

            expect($modal.open).toHaveBeenCalled();
        }));

    });

});
