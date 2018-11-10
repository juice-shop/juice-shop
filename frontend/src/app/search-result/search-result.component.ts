import { ProductDetailsComponent } from '../product-details/product-details.component'
import { ActivatedRoute, Router } from '@angular/router'
import { ProductService } from '../Services/product.service'
import { BasketService } from '../Services/basket.service'
import { AfterViewInit, Component, NgZone, OnDestroy, ViewChild } from '@angular/core'
import { MatPaginator } from '@angular/material/paginator'
import { Subscription } from 'rxjs'
import { MatTableDataSource } from '@angular/material/table'
import { MatDialog } from '@angular/material/dialog'
import { DomSanitizer } from '@angular/platform-browser'
import { TranslateService } from '@ngx-translate/core'
import { SocketIoService } from '../Services/socket-io.service'

import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faCartPlus, faEye } from '@fortawesome/free-solid-svg-icons'

library.add(faEye, faCartPlus)
dom.watch()

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss']
})
export class SearchResultComponent implements AfterViewInit,OnDestroy {

  public displayedColumns = ['Image', 'Product', 'Description', 'Price', 'Select']
  public tableData: any[]
  public dataSource
  public searchValue
  public confirmation = undefined
  @ViewChild(MatPaginator) paginator: MatPaginator
  private productSubscription: Subscription
  private routerSubscription: Subscription

  constructor (private dialog: MatDialog, private productService: ProductService,private basketService: BasketService, private translateService: TranslateService, private router: Router, private route: ActivatedRoute, private sanitizer: DomSanitizer, private ngZone: NgZone, private io: SocketIoService) { }

  ngAfterViewInit () {

    this.productSubscription = this.productService.search('').subscribe((tableData: any) => {
      this.tableData = tableData
      this.trustProductDescription(this.tableData)
      this.dataSource = new MatTableDataSource<Element>(this.tableData)
      this.dataSource.paginator = this.paginator
      this.filterTable()
      this.routerSubscription = this.router.events.subscribe(() => {
        this.filterTable()
      })
    }, (err) => console.log(err))
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
    if (queryParam && queryParam.includes('<iframe src="javascript:alert(`xss`)">')) {
      this.ngZone.runOutsideAngular(() => {
        this.io.socket().emit('localXSSChallengeSolved', queryParam)
      })
    }
    if (queryParam) {
      queryParam = queryParam.trim()
      this.dataSource.filter = queryParam.toLowerCase()
      this.searchValue = this.sanitizer.bypassSecurityTrustHtml(queryParam)
    } else {
      this.dataSource.filter = ''
      this.searchValue = undefined
    }
  }

  showDetail (element: any) {
    this.dialog.open(ProductDetailsComponent, {
      width: '500px',
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
            this.basketService.put(existingBasketItem.id, { quantity: newQuantity }).subscribe((updatedBasketItem) => {
              this.productService.get(updatedBasketItem.ProductId).subscribe((product) => {
                this.translateService.get('BASKET_ADD_SAME_PRODUCT', { product: product.name }).subscribe((basketAddSameProduct) => {
                  this.confirmation = basketAddSameProduct
                }, (translationId) => {
                  this.confirmation = translationId
                })
              }, (err) => console.log(err))
            },(err) => console.log(err))
          }, (err) => console.log(err))
          break
        }
      }
      if (!found) {
        this.basketService.save({ ProductId: id, BasketId: sessionStorage.getItem('bid'), quantity: 1 }).subscribe((newBasketItem) => {
          this.productService.get(newBasketItem.ProductId).subscribe((product) => {
            this.translateService.get('BASKET_ADD_PRODUCT', { product: product.name }).subscribe((basketAddProduct) => {
              this.confirmation = basketAddProduct
            }, (translationId) => {
              this.confirmation = translationId
            })
          }, (err) => console.log(err))
        }, (err) => console.log(err))
      }
    }, (err) => console.log(err))
  }

  trustProductDescription (tableData: any[]) {
    for (let i = 0; i < tableData.length; i++) {
      tableData[i].description = this.sanitizer.bypassSecurityTrustHtml(tableData[i].description)
    }
  }

  isLoggedIn () {
    return localStorage.getItem('token')
  }

}
