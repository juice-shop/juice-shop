import { Component,OnInit } from '@angular/core'
import { ConfigurationService } from "../Services/configuration.service";
import fontawesome from '@fortawesome/fontawesome'
import { faFacebook,faTwitter } from '@fortawesome/fontawesome-free-brands'
fontawesome.library.add(faFacebook, faTwitter)

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  public twitterUrl = null
  public facebookUrl = null

  constructor (private configurationService: ConfigurationService) {}

  ngOnInit () {
    this.configurationService.getApplicationConfiguration().subscribe((config) => {
      if (config && config.application) {
        if (config.application.twitterUrl !== null) {
          this.twitterUrl = config.application.twitterUrl
        }
        if (config.application.facebookUrl !== null) {
          this.facebookUrl = config.application.facebookUrl
        }
      }
    },(err) => console.log(err))
  }
}
