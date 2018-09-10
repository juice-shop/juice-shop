import { ActivatedRoute } from '@angular/router'
import { MatTableDataSource } from '@angular/material/table'
import { Component,OnInit } from '@angular/core'
import { TrackOrderService } from './../Services/track-order.service'
import fontawesome from '@fortawesome/fontawesome'
import { faWarehouse,faSync,faSpinner,faTruckLoading,faTruck,faHome } from '@fortawesome/fontawesome-free-solid'
fontawesome.library.add(faWarehouse,faSync,faSpinner,faTruckLoading,faTruck,faHome)

@Component({
  selector: 'app-track-result',
  templateUrl: './track-result.component.html',
  styleUrls: ['./track-result.component.scss']
})
export class TrackResultComponent implements OnInit {

  public displayedColumns = ['product', 'price', 'quantity','total price']
  public dataSource = new MatTableDataSource()
  public orderId
  public results: any = {}

  constructor (private route: ActivatedRoute,private trackOrderService: TrackOrderService) {}

  ngOnInit () {
    this.orderId = this.route.snapshot.queryParams.id
    this.trackOrderService.save(this.orderId).subscribe((results) => {
      this.results.orderNo = this.orderId
      this.results.email = results.data[0].email
      this.results.totalPrice = results.data[0].totalPrice
      this.results.products = results.data[0].products
      this.results.eta = results.data[0].eta
      this.dataSource.data = this.results.products
    })
  }
}
