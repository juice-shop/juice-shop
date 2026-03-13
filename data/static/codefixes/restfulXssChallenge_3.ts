ngAfterViewInit () {
    const products = this.productService.search('')
    const quantities = this.quantityService.getAll()
    forkJoin([quantities, products]).subscribe({
      next: ([quantities, products]) => {
        const dataTable: ProductTableEntry[] = []
        this.tableData = products
        this.trustProductDescription(products)
        for (const product of products) {
          dataTable.push({
            name: product.name,
            price: product.price,
            deluxePrice: product.deluxePrice,
            id: product.id,
            image: product.image,
            description: product.description
          })
        }
        for (const quantity of quantities) {
          const entry = dataTable.find((dataTableEntry) => {
            return dataTableEntry.id === quantity.ProductId
          })
          if (entry === undefined) {
            continue
          }
          entry.quantity = quantity.quantity
        }
        this.dataSource = new MatTableDataSource<ProductTableEntry>(dataTable)
        this.updatePageSizeOptions()
        this.dataSource.paginator = this.paginator
        this.setupResponsivePageSize()
        this.gridDataSource = this.dataSource.connect()
        this.resultsLength = this.dataSource.data.length
        this.filterTable()
        this.routerSubscription = this.router.events.subscribe(() => {
          this.filterTable()
        })
        this.cdRef.detectChanges()
      },
      error: (err) => { console.log(err) }
    })
  }

  trustProductDescription (tableData: any[]) {
    tableData.forEach((product: any) => {
      product.description = this.sanitizer.bypassSecurityTrustHtml(product.description)
    })
  }