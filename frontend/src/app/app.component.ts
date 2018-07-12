import { ConfigurationService } from './Services/configuration.service'
import { Component, OnInit } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public theme = ''

  constructor (private translate: TranslateService, private configurationService: ConfigurationService) {
    this.translate.setDefaultLang('en')
  }

  ngOnInit () {
    this.configurationService.getApplicationConfiguration().subscribe((conf: any) => {
      this.theme = conf.application.theme
    })
  }
}
