import { Component, Inject } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { Title } from '@angular/platform-browser'
import { DOCUMENT } from '@angular/common'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor (@Inject(DOCUMENT) private _document: HTMLDocument, private titleService: Title, private translate: TranslateService) {
    this.translate.setDefaultLang('en')
  }

  setTitle (newTitle: string) {
    this.titleService.setTitle(newTitle)
  }
}
