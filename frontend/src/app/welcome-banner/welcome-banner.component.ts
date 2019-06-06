import { Component, OnInit } from '@angular/core'
import { ConfigurationService } from '../Services/configuration.service'
import { MatSnackBarRef } from '@angular/material'
import { CookieService } from 'ngx-cookie'

@Component({
  selector: 'app-welcome-banner',
  templateUrl: 'welcome-banner.component.html',
  styleUrls: ['./welcome-banner.component.scss']
})
export class WelcomeBannerComponent implements OnInit {
  public applicationName: string = 'OWASP Juice Shop'

  private readonly welcomeBannerStatusCookieKey = 'welcome-banner-status'

  constructor (
        public snackBarRef: MatSnackBarRef<WelcomeBannerComponent>,
        private configurationService: ConfigurationService,
        private cookieService: CookieService) { }

  ngOnInit (): void {
    let welcomeBannerStatus = this.cookieService.get(this.welcomeBannerStatusCookieKey)
    if (welcomeBannerStatus === 'dismiss') {
      this.snackBarRef.dismiss()
    } else {
      this.configurationService.getApplicationConfiguration().subscribe((config) => {
        if (config && config.application) {
          if (config.application.name !== null) {
            this.applicationName = config.application.name
          }
        }
      }, (err) => console.log(err))
    }
  }

  closeWelcome (): void {
    this.snackBarRef.dismiss()
    this.cookieService.put(this.welcomeBannerStatusCookieKey, 'dismiss')
  }
}
