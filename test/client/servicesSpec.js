describe('service', function () {
    beforeEach(module('myApp'));

    describe('UserService', function () {
        it('should be defined', inject(function (UserService) {
            expect(UserService).toBeDefined();
        }));
    });

});
