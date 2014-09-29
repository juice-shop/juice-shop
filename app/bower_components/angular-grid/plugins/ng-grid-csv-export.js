// Todo:
// 1) Make the button prettier
// 2) add a config option for IE users which takes a URL.  That URL should accept a POST request with a
//    JSON encoded object in the payload and return a CSV.  This is necessary because IE doesn't let you
//    download from a data-uri link
//
// Notes:  This has not been adequately tested and is very much a proof of concept at this point
function ngGridCsvExportPlugin (opts) {
    var self = this;
    self.grid = null;
    self.scope = null;
    self.services = null;
    
    opts = opts || {};
    opts.containerPanel = opts.containerPanel || '.ngFooterPanel';
    opts.linkClass = opts.linkCss || 'csv-data-link-span'; 
    opts.linkLabel = opts.linkLabel || 'CSV Export';
    opts.fileName = opts.fileName || 'Export.csv';

    self.init = function(scope, grid, services) {
        self.grid = grid;
        self.scope = scope;
        self.services = services;

        function showDs() {
            function csvStringify(str) {
                if (str == null) { // we want to catch anything null-ish, hence just == not ===
                    return '';
                }
                if (typeof(str) === 'number') {
                    return '' + str;
                }
                if (typeof(str) === 'boolean') {
                    return (str ? 'TRUE' : 'FALSE') ;
                }
                if (typeof(str) === 'string') {
                    return str.replace(/"/g,'""');
                }

                return JSON.stringify(str).replace(/"/g,'""');
            }

            var keys = [];
            var csvData = '';
            for (var f in grid.config.columnDefs) { 
                if (grid.config.columnDefs.hasOwnProperty(f))
                {   
                    keys.push(grid.config.columnDefs[f].field);
                    csvData += '"' ;
                    if(typeof grid.config.columnDefs[f].displayName !== 'undefined'){/** moved to reduce looping and capture the display name if it exists**/
                        csvData += csvStringify(grid.config.columnDefs[f].displayName);
                    }
                    else{
                        csvData += csvStringify(grid.config.columnDefs[f].field);
                    }
                    csvData +=  '",';
                }   
            }   
            
            function swapLastCommaForNewline(str) {
                var newStr = str.substr(0,str.length - 1);
                return newStr + "\n";
            }
            
            csvData = swapLastCommaForNewline(csvData);
            var gridData = grid.data;
            for (var gridRow in gridData) {
                var rowData = '';
                for ( var k in keys) {
                    var curCellRaw;

                    if (opts != null && opts.columnOverrides != null && opts.columnOverrides[keys[k]] != null) {
                        curCellRaw = opts.columnOverrides[keys[k]](
                            self.services.UtilityService.evalProperty(gridData[gridRow], keys[k]));
                    } else {
                        curCellRaw = self.services.UtilityService.evalProperty(gridData[gridRow], keys[k]);
                    }

                    rowData += '"' + csvStringify(curCellRaw) + '",';
                }
                csvData += swapLastCommaForNewline(rowData);
            }
            var fp = grid.$root.find(opts.containerPanel);
            var csvDataLinkPrevious = grid.$root.find(opts.containerPanel + ' .' + opts.linkClass);
            if (csvDataLinkPrevious != null) {csvDataLinkPrevious.remove() ; }
            var csvDataLinkHtml = '<span class="' + opts.linkClass + '">';
            csvDataLinkHtml += '<br><a href="data:text/csv;charset=UTF-8,';
            csvDataLinkHtml += encodeURIComponent(csvData);
            csvDataLinkHtml += '" download="' + opts.fileName + '">' + opts.linkLabel + '</a></br></span>' ;
            fp.append(csvDataLinkHtml);
        }
        setTimeout(showDs, 0);
        scope.catHashKeys = function() {
            var hash = '';
            for (var idx in scope.renderedRows) {
                hash += scope.renderedRows[idx].$$hashKey;
            }
            return hash;
        };
        if (opts && opts.customDataWatcher) {
            scope.$watch(opts.customDataWatcher, showDs);
        } else {
            scope.$watch(scope.catHashKeys, showDs);
        }
    };
}
