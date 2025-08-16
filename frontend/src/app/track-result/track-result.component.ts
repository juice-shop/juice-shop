/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { ActivatedRoute } from '@angular/router'
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table'
import { Component, type OnInit } from '@angular/core'
import { TrackOrderService } from '../Services/track-order.service'
import { DomSanitizer } from '@angular/platform-browser'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faHome, faSync, faTruck, faTruckLoading, faWarehouse } from '@fortawesome/free-solid-svg-icons'

import { TranslateModule } from '@ngx-translate/core'
import { MatCardModule } from '@angular/material/card'

library.add(faWarehouse, faSync, faTruckLoading, faTruck, faHome)

export enum Status {
  New,
  Packing,
  Transit,
  Delivered
}

@Component({
  selector: 'app-track-result',
  templateUrl: './track-result.component.html',
  styleUrls: ['./track-result.component.scss'],
  imports: [MatCardModule, TranslateModule, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow]
})
export class TrackResultComponent implements OnInit {
  public displayedColumns = ['product', 'price', 'quantity', 'total price']
  public dataSource = new MatTableDataSource()
  public orderId?: string
  public results: any = {}
  public status: Status = Status.New
  public Status = Status
  constructor (private readonly route: ActivatedRoute, private readonly trackOrderService: TrackOrderService, private readonly sanitizer: DomSanitizer) {}

  ngOnInit (): void {
    this.orderId = this.route.snapshot.queryParams.id
    this.trackOrderService.find(this.orderId).subscribe((results) => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      this.results.orderNo = this.sanitizer.bypassSecurityTrustHtml(`<code>${results.data[0].orderId}</code>`)
      this.results.email = results.data[0].email
      this.results.totalPrice = results.data[0].totalPrice
      this.results.products = results.data[0].products
      this.results.eta = results.data[0].eta !== undefined ? results.data[0].eta : '?'
      this.results.bonus = results.data[0].bonus
      this.dataSource.data = this.results.products
      if (results.data[0].delivered) {
        this.status = Status.Delivered
      } else if (this.route.snapshot.data.type) {
        this.status = Status.New
      } else if (this.results.eta > 2) {
        this.status = Status.Packing
      } else {
        this.status = Status.Transit
      }
    })
  }
}
