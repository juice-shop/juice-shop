function ngGridLayoutPlugin () {
    var self = this;
    this.grid = null;
    this.scope = null;
    this.init = function(scope, grid, services) {
        self.domUtilityService = services.DomUtilityService;
        self.grid = grid;
        self.scope = scope;
    };

    this.updateGridLayout = function () {
        if (!self.scope.$$phase) {
            self.scope.$apply(function(){
                self.domUtilityService.RebuildGrid(self.scope, self.grid);
            });
        }
        else {
            // $digest or $apply already in progress
            self.domUtilityService.RebuildGrid(self.scope, self.grid);
        }
    };
}
