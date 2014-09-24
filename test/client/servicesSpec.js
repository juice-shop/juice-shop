describe('service', function () {
    var $httpBackend, result;

    beforeEach(module('myApp'));
    beforeEach(inject(function($injector) {
        $httpBackend = $injector.get('$httpBackend');
        result = undefined;
    }));

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('UserService', function () {
        it('should be defined', inject(function (UserService) {
            expect(UserService).toBeDefined();
            expect(UserService.find).toBeDefined();
            expect(UserService.get).toBeDefined();
            expect(UserService.del).toBeDefined();
        }));

        it('should get all users directly from the rest api', inject(function (UserService) {
            $httpBackend.whenGET('/api/Users/').respond(200, 'apiResponse');

            UserService.find().success(function (data) { result = data; });
            $httpBackend.flush();

            expect(result).toBe('apiResponse');
        }));

        it('should get single users directly from the rest api', inject(function (UserService) {
            $httpBackend.whenGET('/api/Users/1').respond(200, 'apiResponse');

            UserService.get(1).success(function (data) { result = data; });
            $httpBackend.flush();

            expect(result).toBe('apiResponse');
        }));

        it('should delete user directly via the rest api', inject(function (UserService) {
            $httpBackend.whenDELETE('/api/Users/1').respond(200, 'apiResponse');

            UserService.del(1).success(function (data) { result = data; });
            $httpBackend.flush();

            expect(result).toBe('apiResponse');
        }));

        it('should create user directly via the rest api', inject(function (UserService) {
            $httpBackend.whenPOST('/api/Users/').respond(200, 'apiResponse');

            UserService.save().success(function (data) { result = data; });
            $httpBackend.flush();

            expect(result).toBe('apiResponse');
        }));

    });

    describe('ProductService', function () {
        it('should be defined', inject(function (ProductService) {
            expect(ProductService).toBeDefined();
            expect(ProductService.find).toBeDefined();
            expect(ProductService.get).toBeDefined();
        }));

        it('should get all products directly from the rest api', inject(function (ProductService) {
            $httpBackend.whenGET('/api/Products/').respond(200, 'apiResponse');

            ProductService.find().success(function (data) { result = data; });
            $httpBackend.flush();

            expect(result).toBe('apiResponse');
        }));

        it('should get single product directly from the rest api', inject(function (ProductService) {
            $httpBackend.whenGET('/api/Products/1').respond(200, 'apiResponse');

            ProductService.get(1).success(function (data) { result = data; });
            $httpBackend.flush();

            expect(result).toBe('apiResponse');
        }));

    });

    describe('FeedbackService', function () {
        it('should be defined', inject(function (FeedbackService) {
            expect(FeedbackService).toBeDefined();
            expect(FeedbackService.find).toBeDefined();
            expect(FeedbackService.save).toBeDefined();
            expect(FeedbackService.del).toBeDefined();
        }));

        it('should get all feedback directly from the rest api', inject(function (FeedbackService) {
            $httpBackend.whenGET('/api/Feedbacks/').respond(200, 'apiResponse');

            FeedbackService.find().success(function (data) { result = data; });
            $httpBackend.flush();

            expect(result).toBe('apiResponse');
        }));

        it('should delete feedback directly via the rest api', inject(function (FeedbackService) {
            $httpBackend.whenDELETE('/api/Feedbacks/1').respond(200, 'apiResponse');

            FeedbackService.del(1).success(function (data) { result = data; });
            $httpBackend.flush();

            expect(result).toBe('apiResponse');
        }));

        it('should create feedback directly via the rest api', inject(function (FeedbackService) {
            $httpBackend.whenPOST('/api/Feedbacks/').respond(200, 'apiResponse');

            FeedbackService.save().success(function (data) { result = data; });
            $httpBackend.flush();

            expect(result).toBe('apiResponse');
        }));
    });

});
