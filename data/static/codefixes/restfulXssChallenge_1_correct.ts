ngAfterViewInit () {
    const products = this.productService.search('')
    const quantities = this.quantityService.getAll()
    forkJoin([quantities, products]).subscribe(([quantities, products]) => {
      const dataTable: TableEntry[] = []
      this.tableData = products
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
      this.dataSource = new MatTableDataSource<TableEntry>(dataTable)
      for (let i = 1; i <= Math.ceil(this.dataSource.data.length / 12); i++) {
        this.pageSizeOptions.push(i * 12)
      }
      this.paginator.pageSizeOptions = this.pageSizeOptions
      this.dataSource.paginator = this.paginator
      this.gridDataSource = this.dataSource.connect()
      this.resultsLength = this.dataSource.data.length
      this.filterTable()
      this.routerSubscription = this.router.events.subscribe(() => {
        this.filterTable()
      })
      if (window.innerWidth < 2600) {
        this.breakpoint = 4
        if (window.innerWidth < 1740) {
          this.breakpoint = 3
          if (window.innerWidth < 1280) {
            this.breakpoint = 2
            if (window.innerWidth < 850) {
              this.breakpoint = 1
            }
          }
        }
      } else {
        this.breakpoint = 6
      }
      this.cdRef.detectChanges()
    }, (err) => { console.log(err) })
  }