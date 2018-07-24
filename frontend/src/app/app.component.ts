import { ConfigurationService } from './Services/configuration.service'
import { Component, OnInit } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { Title } from '@angular/platform-browser'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public theme = ''

  constructor (private titleService: Title, private translate: TranslateService, private configurationService: ConfigurationService) {
    this.translate.setDefaultLang('en')
  }

  ngOnInit () {
    this.configurationService.getApplicationConfiguration().subscribe((conf: any) => {
      this.theme = conf.application.theme
      this.setTitle(conf.application.name)
    })
  }

  setTitle (newTitle: string) {
    this.titleService.setTitle(newTitle)
  }
}
