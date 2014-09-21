describe('service', function () {
    beforeEach(module('myApp'));

    describe('UserService', function () {
        it('should be defined', inject(function (UserService) {
            expect(UserService).toBeDefined();
            expect(UserService.find).toBeDefined();
            expect(UserService.get).toBeDefined();
        }));
    });

    describe('ProductService', function () {
        it('should be defined', inject(function (ProductService) {
            expect(ProductService).toBeDefined();
            expect(ProductService.find).toBeDefined();
            expect(ProductService.get).toBeDefined();
        }));
    });

});
