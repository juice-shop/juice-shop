function ngGridPdfExportPlugin (options) {
    var self = this;
    self.grid = null;
    self.scope = null;
    self.services = null;
    self.options = options;

    self.init = function (scope, grid, services) {
        self.grid = grid;
        self.scope = scope;
        self.services = services;

        if (!options.inhibitButton) {
            var fp = grid.$root.find(".ngFooterPanel");
            var pdfDataLinkPrevious = grid.$root.find('.ngFooterPanel .pdf-data-link-span');
            if (pdfDataLinkPrevious != null) {pdfDataLinkPrevious.remove() ; }
            var pdfDataLinkHtml = '<button class="pdf-data-link-span">PDF Export</button>' ;
            fp.append(pdfDataLinkHtml);
            fp.on('click', function() {
                self.createPDF();
            });
        }
    };

    self.createPDF = function () {
        var headers = [],
            data = [],
            footers = {},
            gridWidth = self.scope.totalRowWidth(),
            margin = 15;  // mm defined as unit when setting up jsPDF

        angular.forEach(self.scope.columns, function (col) {
            if (col.visible && (col.width === undefined || col.width > 0)) {
                headers.push({name: col.field, prompt:col.displayName, width: col.width * (185 / gridWidth), align: (col.colDef.align || 'left')});
                if (col.colDef.totalsRow) {
                    footers[col.field] = self.scope.getTotalVal(col.field, col.filter).toString();
                }
            }
        });

        angular.forEach(self.grid.filteredRows, function (row) {
            data.push(angular.copy(row.entity));
        });

        var doc = new jsPDF('landscape','mm','a4');
        doc.setFontStyle('bold');
        doc.setFontSize(12);
        if (self.scope.reportSchema && self.scope.reportSchema.title) {
            doc.text(self.scope.reportSchema.title,margin,margin);
        }
        doc.setFontStyle('normal');
        doc.setFontSize(12);
        doc.cellInitialize();
        doc.table(margin, 24, data, 
                {
                    headers:headers,
                    footers:footers,
                    printHeaders: true,
                    autoSize: false,
                    fontSize:12,
                    margins: {
                            left:margin,
                            top:margin,
                            bottom:margin,
                            width:doc.internal.pageSize - margin}
                });
        doc.output('dataurlnewwindow');
    };
}
