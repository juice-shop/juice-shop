describe('services', function () {
    var $httpBackend, result;

    beforeEach(module('myApp'));
    beforeEach(inject(function($injector) {
        $httpBackend = $injector.get('$httpBackend');
        result = undefined;
    }));

    describe('UserService', function () {
        it('should be defined', inject(function (UserService) {
            expect(UserService).toBeDefined();
            expect(UserService.find).toBeDefined();
            expect(UserService.get).toBeDefined();
            expect(UserService.changePassword).toBeDefined();
            expect(UserService.whoAmI).toBeDefined();
        }));

        it('should get all users directly from the rest api', inject(function (UserService) {
            $httpBackend.whenGET('/rest/user/authentication-details/').respond(200, 'apiResponse');

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

        it('should create user directly via the rest api', inject(function (UserService) {
            $httpBackend.whenPOST('/api/Users/').respond(200, 'apiResponse');

            UserService.save().success(function (data) { result = data; });
            $httpBackend.flush();

            expect(result).toBe('apiResponse');
        }));

        it('should login user directly via the rest api', inject(function (UserService) {
            $httpBackend.whenPOST('/rest/user/login').respond(200, 'apiResponse');

            UserService.login().success(function (data) { result = data; });
            $httpBackend.flush();

            expect(result).toBe('apiResponse');
        }));

        it('should change user password directly via the rest api', inject(function (UserService) {
            $httpBackend.whenGET('/rest/user/change-password?current=foo&new=bar&repeat=bar').respond(200, 'apiResponse');

            UserService.changePassword({current: 'foo', new: 'bar', repeat: 'bar'}).success(function (data) { result = data; });
            $httpBackend.flush();

            expect(result).toBe('apiResponse');
        }));

    });

    describe('ProductService', function () {
        it('should be defined', inject(function (ProductService) {
            expect(ProductService).toBeDefined();
            expect(ProductService.find).toBeDefined();
            expect(ProductService.get).toBeDefined();
            expect(ProductService.search).toBeDefined();
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

    describe('BasketService', function () {
        it('should be defined', inject(function (BasketService) {
            expect(BasketService).toBeDefined();
            expect(BasketService.find).toBeDefined();
            expect(BasketService.get).toBeDefined();
            expect(BasketService.put).toBeDefined();
            expect(BasketService.del).toBeDefined();
        }));

        it('should get basket directly from the rest api', inject(function (BasketService) {
            $httpBackend.whenGET('/rest/basket/1').respond(200, 'apiResponse');

            BasketService.find(1).success(function (data) { result = data; });
            $httpBackend.flush();

            expect(result).toBe('apiResponse');
        }));

        it('should get single basket item directly via the rest api', inject(function (BasketService) {
            $httpBackend.whenGET('/api/BasketItems/1').respond(200, 'apiResponse');

            BasketService.get(1).success(function (data) { result = data; });
            $httpBackend.flush();

            expect(result).toBe('apiResponse');
        }));

        it('should create basket item directly via the rest api', inject(function (BasketService) {
            $httpBackend.whenPOST('/api/BasketItems/').respond(200, 'apiResponse');

            BasketService.save().success(function (data) { result = data; });
            $httpBackend.flush();

            expect(result).toBe('apiResponse');
        }));

        it('should update basket item directly via the rest api', inject(function (BasketService) {
            $httpBackend.whenPUT('/api/BasketItems/1').respond(200, 'apiResponse');

            BasketService.put(1, {}).success(function (data) { result = data; });
            $httpBackend.flush();

            expect(result).toBe('apiResponse');
        }));

        it('should delete basket item directly via the rest api', inject(function (BasketService) {
            $httpBackend.whenDELETE('/api/BasketItems/1').respond(200, 'apiResponse');

            BasketService.del(1).success(function (data) { result = data; });
            $httpBackend.flush();

            expect(result).toBe('apiResponse');
        }));

        it('should place order for basket via the rest api', inject(function (BasketService) {
            $httpBackend.whenPOST('/rest/basket/1/order').respond(200, 'apiResponse');

            BasketService.order(1).success(function (data) { result = data; });
            $httpBackend.flush();

            expect(result).toBe('apiResponse');
        }));

    });

    describe('ChallengeService', function () {
        it('should be defined', inject(function (ChallengeService) {
            expect(ChallengeService).toBeDefined();
            expect(ChallengeService.find).toBeDefined();
        }));

        it('should get all feedback directly from the rest api', inject(function (ChallengeService) {
            $httpBackend.whenGET('/api/Challenges/').respond(200, 'apiResponse');

            ChallengeService.find().success(function (data) { result = data; });
            $httpBackend.flush();

            expect(result).toBe('apiResponse');
        }));

    });



});
