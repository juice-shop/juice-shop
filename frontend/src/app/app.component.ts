import { ConfigurationService } from './Services/configuration.service'
import { Component, OnInit, Inject } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { DOCUMENT, Title } from '@angular/platform-browser'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public theme = ''

  constructor (@Inject(DOCUMENT) private _document: HTMLDocument, private titleService: Title, private translate: TranslateService, private configurationService: ConfigurationService) {
    this.translate.setDefaultLang('en')
  }

  ngOnInit () {
    this.configurationService.getApplicationConfiguration().subscribe((conf: any) => {
      this.theme = conf.application.theme
      this.setTitle(conf.application.name)
      let icon = conf.application.favicon
      icon = decodeURIComponent(icon.substring(icon.lastIndexOf('/') + 1))
      this._document.getElementById('favicon').setAttribute('href', '/assets/public/' + icon)
    })
  }

  setTitle (newTitle: string) {
    this.titleService.setTitle(newTitle)
  }
}
