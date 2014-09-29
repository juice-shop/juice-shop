function ngGridWYSIWYGPlugin (filter) {
    var self = this;
    self.grid = null;
    self.scope = null;
    self.services = null;

    self.init = function (scope, grid, services) {
        self.grid = grid;
        self.scope = scope;
        self.services = services;
    };

    self.exportData = function () {
        var ret = {
            columns: [],
            columnWidths: [],
            gridWidth: self.scope.totalRowWidth(),
            data: []
        };
        
        angular.forEach(self.scope.columns, function (col) {
            if (col.visible) {
                ret.columns.push(col.displayName);
                ret.columnWidths.push(col.width);
            }
        });
        angular.forEach(self.grid.filteredRows, function (row) {
            var item = row.entity;
            angular.forEach(self.scope.columns, function (col) {
                if (col.visible) {
                    var obj = self.services.UtilityService.evalProperty(item, col.field);
                    var val = col.cellFilter && filter ? filter(col.cellFilter)(obj) : obj;
                    ret.data.push(val ? val.toString() : '');
                }
            });
        });
        return ret;
    };
}