import { Component, OnInit } from '@angular/core'
import { TrackOrderService } from '../Services/track-order.service'
import { ActivatedRoute, ParamMap } from '@angular/router'
import { MatTableDataSource } from '@angular/material/table'

@Component({
  selector: 'app-order-completion',
  templateUrl: './order-completion.component.html',
  styleUrls: ['./order-completion.component.scss']
})
export class OrderCompletionComponent implements OnInit {

  public tableColumns = ['product','price','quantity','total price']
  public dataSource
  public orderId
  public orderDetails: any = { totalPrice: 0 }
  public deliveryPrice = 0
  public promotionalDiscount = 0

  constructor (private trackOrderService: TrackOrderService, public activatedRoute: ActivatedRoute) { }

  ngOnInit () {
    this.activatedRoute.paramMap.subscribe((paramMap: ParamMap) => {
      this.orderId = paramMap.get('id')
      this.trackOrderService.save(this.orderId).subscribe((results) => {
        this.orderDetails.totalPrice = results.data[0].totalPrice
        this.orderDetails.eta = results.data[0].eta || '?'
        this.orderDetails.bonus = results.data[0].bonus
        this.dataSource = new MatTableDataSource<Element>(results.data[0].products)
      },(err) => console.log(err))
    },(err) => console.log(err))
  }
}
