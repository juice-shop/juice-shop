import { ConfigurationService } from '../Services/configuration.service'
import { Component, OnInit } from '@angular/core'
import fontawesome from '@fortawesome/fontawesome'
import { faBitcoin } from '@fortawesome/fontawesome-free-brands'
import { faUniversity, faGraduationCap, faComments, faCommentAlt } from '@fortawesome/fontawesome-free-solid'
import { faCommentAlt as farCommentAlt, faComments as farComments } from '@fortawesome/fontawesome-free-regular'

fontawesome.library.add(faBitcoin, faUniversity, faGraduationCap, faCommentAlt, faComments, farCommentAlt, farComments)

@Component({
  selector: 'app-token-sale',
  templateUrl: './token-sale.component.html',
  styleUrls: ['./token-sale.component.scss']
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
