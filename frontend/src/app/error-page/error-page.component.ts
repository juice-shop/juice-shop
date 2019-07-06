import { TranslateService } from '@ngx-translate/core'
import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { faUserSlash } from '@fortawesome/free-solid-svg-icons'

library.add(faUserSlash)
dom.watch()

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.scss']
})
export class ErrorPageComponent implements OnInit {

  public error: string | null = null

  constructor (private route: ActivatedRoute, private translate: TranslateService) {
  }

  ngOnInit () {
    const errorKey = this.route.snapshot.queryParams['error']
    if (errorKey) {
      this.translate.get(errorKey).subscribe((errorMessage) => {
        this.error = errorMessage
      }, (translationId) => {
        this.error = translationId
      })
    }
  }
}
