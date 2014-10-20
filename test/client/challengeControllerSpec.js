describe('controllers', function () {
    var scope, controller, $httpBackend, $sce;

    beforeEach(module('myApp'));
    beforeEach(inject(function($injector) {
        $httpBackend = $injector.get('$httpBackend');
        $sce = $injector.get('$sce');
    }));

    describe('ChallengeController', function () {
        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            controller = $controller('ChallengeController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
        }));

        it('should hold existing challenges', inject(function ($controller) {
            $httpBackend.whenGET('/api/Challenges/').respond(200, {data: [{description: 'XSS'},{description: 'CSRF'}]});

            $httpBackend.flush();

            expect(scope.challenges.length).toBe(2);
            expect(scope.challenges[0].description).toBeDefined();
            expect(scope.challenges[1].description).toBeDefined();
        }));

        it('should consider challenge description as trusted HTML', inject(function ($controller) {
            $httpBackend.whenGET('/api/Challenges/').respond(200, {data: [{description: '<a src="link">Link</a>'}]});
            spyOn($sce, 'trustAsHtml');

            $httpBackend.flush();

            expect($sce.trustAsHtml).toHaveBeenCalledWith('<a src="link">Link</a>');
        }));

        it('should hold nothing when no challenges exists', inject(function ($controller) {
            $httpBackend.whenGET('/api/Challenges/').respond(200, {data: {}});

            $httpBackend.flush();

            expect(scope.challenges).toEqual({});
        }));

        it('should hold nothing on error from backend API', inject(function ($controller) {
            $httpBackend.whenGET('/api/Challenges/').respond(500);

            $httpBackend.flush();

            expect(scope.challenges).toBeUndefined();
        }));

    });

});
