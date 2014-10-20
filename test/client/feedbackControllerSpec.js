describe('controllers', function () {
    var scope, controller, $httpBackend, $sce;

    beforeEach(module('myApp'));
    beforeEach(inject(function($injector) {
        $httpBackend = $injector.get('$httpBackend');
        $sce = $injector.get('$sce');
    }));

    describe('FeedbackController', function () {
        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            controller = $controller('FeedbackController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
            expect(scope.delete).toBeDefined();
        }));

        it('should hold existing feedback', inject(function ($controller) {
            $httpBackend.whenGET('/api/Feedbacks/').respond(200, {data: [{comment: 'a'},{comment: 'b'}]});

            $httpBackend.flush();

            expect(scope.feedbacks.length).toBe(2);
            expect(scope.feedbacks[0].comment).toBeDefined();
            expect(scope.feedbacks[1].comment).toBeDefined();
        }));

        it('should add an image to feedback', inject(function ($controller) {
            $httpBackend.whenGET('/api/Feedbacks/').respond(200, {data: [{}]});

            $httpBackend.flush();

            expect(scope.feedbacks[0].image).toBeDefined();
        }));

        it('should consider feedback comment as trusted HTML', inject(function ($controller) {
            $httpBackend.whenGET('/api/Feedbacks/').respond(200, {data: [{comment: '<script>alert("XSS3")</script>'}]});
            spyOn($sce, 'trustAsHtml');

            $httpBackend.flush();

            expect($sce.trustAsHtml).toHaveBeenCalledWith('<script>alert("XSS3")</script>');
        }));

        it('should hold nothing when no feedback exists', inject(function ($controller) {
            $httpBackend.whenGET('/api/Feedbacks/').respond(200, {data: {}});

            $httpBackend.flush();

            expect(scope.feedbacks).toEqual({});
        }));

        it('should hold nothing on error from backend API', inject(function ($controller) {
            $httpBackend.whenGET('/api/Feedbacks/').respond(500);

            $httpBackend.flush();

            expect(scope.feedbacks).toBeUndefined();
        }));

        it('should pass delete request for feedback to backend API', inject(function ($controller) {
            $httpBackend.whenGET('/api/Feedbacks/').respond(200, {data: [{id: 42}]});
            $httpBackend.whenDELETE('/api/Feedbacks/42').respond(200);

            scope.delete(42);
            $httpBackend.flush();
        }));

        it('should gracefully handle error while deleting feedback', inject(function ($controller) {
            $httpBackend.whenGET('/api/Feedbacks/').respond(200, {data: [{id: 42}]});
            $httpBackend.whenDELETE('/api/Feedbacks/4711').respond(500);

            scope.delete(4711);
            $httpBackend.flush();
        }));

    });

});
