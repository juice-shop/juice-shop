import { ConfigurationService } from './../Services/configuration.service'
import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'app-token-sale',
  templateUrl: './token-sale.component.html',
  styleUrls: ['./token-sale.component.css']
})
export class TokenSaleComponent implements OnInit {

  public altcoinName = 'Juicycoin'
  constructor (private configurationService: ConfigurationService) { }

  ngOnInit () {
    this.configurationService.getApplicationConfiguration().subscribe((config: any) => {
      if (config && config.application && config.application.altcoinName !== null) {
        this.altcoinName = config.application.altcoinName
      }
    }, (err) => console.log(err))
  }

}
