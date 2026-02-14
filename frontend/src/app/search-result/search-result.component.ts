/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

/* eslint-disable @typescript-eslint/prefer-for-of */
import { ActivatedRoute, Router } from '@angular/router'
import { ProductService } from '../Services/product.service'
import { type AfterViewInit, Component, NgZone, type OnDestroy, ViewChild, ChangeDetectorRef, inject } from '@angular/core'
import { MatPaginator } from '@angular/material/paginator'
import { BehaviorSubject, forkJoin, type Subscription } from 'rxjs'
import { MatTableDataSource } from '@angular/material/table'
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser'
import { TranslateModule } from '@ngx-translate/core'
import { SocketIoService } from '../Services/socket-io.service'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faCartPlus, faEye } from '@fortawesome/free-solid-svg-icons'
import { ProductTableEntry } from '../Models/product.model'
import { QuantityService } from '../Services/quantity.service'
import { DeluxeGuard } from '../app.guard'
import { MatDivider } from '@angular/material/divider'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule, MatCardTitle, MatCardContent } from '@angular/material/card'
import { AsyncPipe } from '@angular/common'
import { ProductComponent } from '../product/product.component'

library.add(faEye, faCartPlus)

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss'],
  imports: [MatCardModule, TranslateModule, MatButtonModule, MatCardTitle, MatCardContent, MatDivider, MatPaginator, AsyncPipe, ProductComponent]
})
export class SearchResultComponent implements OnDestroy, AfterViewInit {
  private readonly deluxeGuard = inject(DeluxeGuard)
  private readonly productService = inject(ProductService)
  private readonly quantityService = inject(QuantityService)
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)
  private readonly sanitizer = inject(DomSanitizer)
  private readonly ngZone = inject(NgZone)
  private readonly io = inject(SocketIoService)
  private readonly cdRef = inject(ChangeDetectorRef)

  public tableData!: ProductTableEntry[]
  public pageSizeOptions: number[] = []
  public dataSource!: MatTableDataSource<ProductTableEntry>
  public gridDataSource!: BehaviorSubject<ProductTableEntry[]>
  public searchValue?: SafeHtml
  public resultsLength = 0
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator
  private routerSubscription?: Subscription
  private gridDataSourceSubscription?: Subscription
  public emptyState = false

  // vuln-code-snippet start restfulXssChallenge
  ngAfterViewInit () {
    const products = this.productService.search('')
    const quantities = this.quantityService.getAll()
    forkJoin([quantities, products]).subscribe({
      next: ([quantities, products]) => {
        const dataTable: ProductTableEntry[] = []
        this.tableData = products
        this.trustProductDescription(products) // vuln-code-snippet neutral-line restfulXssChallenge
        for (const product of products) {
          dataTable.push({
            name: product.name,
            price: product.price,
            deluxePrice: product.deluxePrice,
            id: product.id,
            image: product.image,
            description: product.description,
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
        const challenge: string = this.route.snapshot.queryParams.challenge // vuln-code-snippet hide-start
        if (challenge && this.route.snapshot.url.join('').match(/hacking-instructor/)) {
          this.startHackingInstructor(decodeURIComponent(challenge))
        } // vuln-code-snippet hide-end
        this.cdRef.detectChanges()
      },
      error: (err) => { console.log(err) }
    })
  }

  trustProductDescription (tableData: any[]) { // vuln-code-snippet neutral-line restfulXssChallenge
    for (let i = 0; i < tableData.length; i++) { // vuln-code-snippet neutral-line restfulXssChallenge
      tableData[i].description = this.sanitizer.bypassSecurityTrustHtml(tableData[i].description) // vuln-code-snippet vuln-line restfulXssChallenge
    } // vuln-code-snippet neutral-line restfulXssChallenge
  } // vuln-code-snippet neutral-line restfulXssChallenge

  // vuln-code-snippet end restfulXssChallenge

  ngOnDestroy () {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe()
    }

    if (this.dataSource) {
      this.dataSource.disconnect()
    }

    if (this.gridDataSourceSubscription) {
      this.gridDataSourceSubscription.unsubscribe()
    }
  }

  // vuln-code-snippet start localXssChallenge xssBonusChallenge
  filterTable () {
    let queryParam: string = this.route.snapshot.queryParams.q
    if (queryParam) {
      queryParam = queryParam.trim()
      this.ngZone.runOutsideAngular(() => { // vuln-code-snippet hide-start
        this.io.socket().emit('verifyLocalXssChallenge', queryParam)
      }) // vuln-code-snippet hide-end
      this.dataSource.filter = queryParam.toLowerCase()
      this.searchValue = this.sanitizer.bypassSecurityTrustHtml(queryParam) // vuln-code-snippet vuln-line localXssChallenge xssBonusChallenge
      this.gridDataSourceSubscription = this.gridDataSource.subscribe((result: ProductTableEntry[]) => {
        if (result.length === 0) {
          this.emptyState = true
        } else {
          this.emptyState = false
        }
      })
    } else {
      this.dataSource.filter = ''
      this.searchValue = undefined
      this.emptyState = false
    }
  }
  // vuln-code-snippet end localXssChallenge xssBonusChallenge

  startHackingInstructor (challengeName: string) {
    console.log(`Starting instructions for challenge "${challengeName}"`)
    import(/* webpackChunkName: "tutorial" */ '../../hacking-instructor').then(module => {
      module.startHackingInstructorFor(challengeName)
    })
  }

  isLoggedIn (): boolean {
    return localStorage.getItem('token') !== null
  }

  isDeluxe () {
    return this.deluxeGuard.isDeluxe()
  }
}
