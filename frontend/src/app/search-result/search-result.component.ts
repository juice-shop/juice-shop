import { ProductDetailsComponent } from './../product-details/product-details.component'
import { Router, ActivatedRoute } from '@angular/router'
import { ProductService } from './../Services/product.service'
import { Component, AfterViewInit, ViewChild, OnDestroy } from '@angular/core'
import { MatPaginator } from '@angular/material/paginator'
import { Subscription } from 'rxjs'
import { MatTableDataSource } from '@angular/material/table'
import { MatDialog } from '@angular/material/dialog'
import fontawesome from '@fortawesome/fontawesome'
import { faEye, faCartPlus } from '@fortawesome/fontawesome-free-solid'
fontawesome.library.add(faEye, faCartPlus)

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent implements AfterViewInit,OnDestroy {

  public displayedColumns = ['Image', 'Product', 'Description', 'Price', 'Select']
  public tableData: any[]
  public dataSource
  public searchValue: string
  @ViewChild(MatPaginator) paginator: MatPaginator
  private productSubscription: Subscription
  private routerSubscription: Subscription

  constructor (private dialog: MatDialog, private productService: ProductService, private router: Router, private route: ActivatedRoute) { }

  ngAfterViewInit () {
    this.productSubscription = this.productService.search('').subscribe((tableData: any) => {
      this.tableData = tableData
      this.dataSource = new MatTableDataSource<Element>(this.tableData)
      this.dataSource.paginator = this.paginator
      this.filterTable()
      this.routerSubscription = this.router.events.subscribe(() => {
        this.filterTable()
      })
    })
  }

  ngOnDestroy () {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe()
    }
    if (this.productSubscription) {
      this.productSubscription.unsubscribe()
    }
  }

  filterTable () {
    let queryParam: string = this.route.snapshot.queryParams.q
    if (queryParam) {
      this.searchValue = 'Search for -' + queryParam
      queryParam = queryParam.trim()
      queryParam = queryParam.toLowerCase()
      this.dataSource.filter = queryParam
    } else {
      this.searchValue = 'All Products'
      this.dataSource.filter = ''
    }
  }

  showDetail (element: any) {
    this.dialog.open(ProductDetailsComponent, {
      width: '1000px',
      height: 'max-content',
      data: {
        productData: element
      }
    })
  }

  isLoggedIn () {
    return localStorage.getItem('token')
  }

}
