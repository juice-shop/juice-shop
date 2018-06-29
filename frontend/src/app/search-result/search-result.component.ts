import { ProductDetailsComponent } from './../product-details/product-details.component'
import { Router, ActivatedRoute } from '@angular/router'
import { ProductService } from './../Services/product.service'
import { BasketService } from './../Services/basket.service'
import { Component, ViewChild, OnDestroy, OnInit } from '@angular/core'
import { MatPaginator } from '@angular/material/paginator'
import { Subscription } from 'rxjs'
import { MatTableDataSource } from '@angular/material/table'
import { MatDialog } from '@angular/material/dialog'
import { DomSanitizer } from '@angular/platform-browser'
import fontawesome from '@fortawesome/fontawesome'
import { faEye, faCartPlus } from '@fortawesome/fontawesome-free-solid'
fontawesome.library.add(faEye, faCartPlus)

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent implements OnInit,OnDestroy {

  public displayedColumns = ['Image', 'Product', 'Description', 'Price', 'Select']
  public tableData: any[]
  public dataSource
  public searchValue: string
  @ViewChild(MatPaginator) paginator: MatPaginator
  private productSubscription: Subscription
  private routerSubscription: Subscription

  constructor (private dialog: MatDialog, private productService: ProductService,private basketService: BasketService, private router: Router, private route: ActivatedRoute, private sanitizer: DomSanitizer) { }

  ngOnInit () {
    this.filterTable()
    this.routerSubscription = this.router.events.subscribe(() => {
      this.filterTable()
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
    let queryParam
    this.route.queryParams.subscribe((queryParams) => {
      queryParam = queryParams.q
      queryParam = this.sanitizer.bypassSecurityTrustHtml(queryParam)
      this.productSubscription = this.productService.search(queryParam.changingThisBreaksApplicationSecurity).subscribe((tableData: any) => {
        this.tableData = tableData
        this.dataSource = new MatTableDataSource<Element>(this.tableData)
        this.dataSource.paginator = this.paginator
        if (queryParam.changingThisBreaksApplicationSecurity) {
          this.searchValue = queryParam
        } else {
          this.searchValue = undefined
        }
      })
    })
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

  addToBasket (id: number) {
    this.basketService.find(sessionStorage.getItem('bid')).subscribe((basket) => {
      let productsInBasket: any = basket.Products
      let found = false
      for (let i = 0; i < productsInBasket.length; i++) {
        if (productsInBasket[i].id === id) {
          found = true
          this.basketService.get(productsInBasket[i].BasketItem.id).subscribe((existingBasketItem) => {
            let newQuantity = existingBasketItem.quantity + 1
            this.basketService.put(existingBasketItem.id, { quantity: newQuantity }).subscribe(() => {
              /* Translations to be added when i18n is set up */
            })
          })
          break
        }
      }
      if (!found) {
        this.basketService.save({ ProductId: id, BasketId: sessionStorage.bid, quantity: 1 }).subscribe((newBasketItem) => {
          /* Translations to be added when i18n is set up */
        })
      }
    })
  }

  isLoggedIn () {
    return localStorage.getItem('token')
  }

}
