describe('service', function () {
    beforeEach(module('myApp'));

    describe('UserService', function () {
        it('should be defined', inject(function (UserService) {
            expect(UserService).toBeDefined();
        }));
    });

    describe('ProductService', function () {
        it('should be defined', inject(function (ProductService) {
            expect(ProductService).toBeDefined();
        }));
    });

});
