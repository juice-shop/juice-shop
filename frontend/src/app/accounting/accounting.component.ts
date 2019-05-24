import { ProductService } from '../Services/product.service'
import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core'
import { MatPaginator } from '@angular/material/paginator'
import { Subscription } from 'rxjs'
import { MatTableDataSource } from '@angular/material/table'
import { DomSanitizer } from '@angular/platform-browser'
import { QuantityService } from '../Services/quantity.service'
import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faCheck } from '@fortawesome/free-solid-svg-icons'

library.add(faCheck)
dom.watch()

@Component({
  selector: 'app-accounting',
  templateUrl: './accounting.component.html',
  styleUrls: ['./accounting.component.scss']
})
export class AccountingComponent implements AfterViewInit,OnDestroy {

  public tableData: any[]
  public dataSource
  public gridDataSource
  public confirmation = undefined
  public error = undefined
  @ViewChild(MatPaginator) paginator: MatPaginator
  private productSubscription: Subscription
  private quantitySubscription: Subscription
  public breakpoint: number
  public quantityMap: any
  constructor (private productService: ProductService, private sanitizer: DomSanitizer, private quanitityService: QuantityService) { }

  ngAfterViewInit () {
    this.loadQuantity()
    this.loadProducts()
  }

  loadQuantity () {
    this.quantitySubscription = this.quanitityService.getAll().subscribe((stock) => {
      this.quantityMap = {}
      stock.map((item) => {
        this.quantityMap[item.ProductId] = {
          id: item.id,
          quantity: item.quantity
        }
      })
    },(err) => {
      this.error = err.error
      this.confirmation = null
      console.log(err)
    })
  }

  loadProducts () {
    this.productSubscription = this.productService.search('').subscribe((tableData: any) => {
      this.tableData = tableData
      this.trustProductDescription(this.tableData)
      this.dataSource = new MatTableDataSource<Element>(this.tableData)
      this.dataSource.paginator = this.paginator

      if (window.innerWidth <= 1740) {
        this.breakpoint = 3
        if (window.innerWidth <= 1300) {
          this.breakpoint = 2
          if (window.innerWidth <= 850) {
            this.breakpoint = 1
          }
        }
      } else {
        this.breakpoint = 4
      }
      this.gridDataSource = this.dataSource.connect()
    }, (err) => console.log(err))
  }

  ngOnDestroy () {
    if (this.productSubscription) {
      this.productSubscription.unsubscribe()
    }
    if (this.quantitySubscription) {
      this.quantitySubscription.unsubscribe()
    }
    if (this.dataSource) {
      this.dataSource.disconnect()
    }
  }

  inc (id) {
    this.modifyQuantity(id,1)
  }

  dec (id) {
    this.modifyQuantity(id,-1)
  }

  modifyQuantity (id, value) {
    this.error = null
    this.quanitityService.get(id).subscribe((item) => {
      let newQuantity = item.quantity + value
      this.quanitityService.put(id, { quantity: newQuantity < 0 ? 0 : newQuantity }).subscribe(() => {
        this.confirmation = 'Quantity has been updated'
        this.loadQuantity()
      },(err) => {
        {
          this.error = err.error
          this.confirmation = null
          console.log(err)
        }
      })
    }, (err) => console.log(err))
  }

  modifyPrice (id, value) {
    this.error = null
    this.productService.put(id, { price: value < 0 ? 0 : value }).subscribe(() => {
      this.confirmation = 'Price has been updated'
      this.loadProducts()
    },(err) => {
      this.error = err.error
      this.confirmation = null
      console.log(err)
    })
  }

  trustProductDescription (tableData: any[]) {
    for (let i = 0; i < tableData.length; i++) {
      tableData[i].description = this.sanitizer.bypassSecurityTrustHtml(tableData[i].description)
    }
  }

  onResize (event) {
    if (event.target.innerWidth <= 1740) {
      this.breakpoint = 3
      if (event.target.innerWidth <= 1300) {
        this.breakpoint = 2
        if (event.target.innerWidth <= 850) {
          this.breakpoint = 1
        }
      }
    } else {
      this.breakpoint = 4
    }
  }
}
