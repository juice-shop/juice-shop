import { Component, OnInit } from '@angular/core'
import { ConfigurationService } from '../Services/configuration.service'
import { MatDialogRef } from '@angular/material'
import { CookieService } from 'ngx-cookie'

@Component({
  selector: 'app-welcome-banner',
  templateUrl: 'welcome-banner.component.html',
  styleUrls: ['./welcome-banner.component.scss']
})
export class WelcomeBannerComponent implements OnInit {
  public applicationName: string = 'OWASP Juice Shop'

  private readonly welcomeBannerStatusCookieKey = 'welcomebanner_status'

  constructor (
        public dialogRef: MatDialogRef<WelcomeBannerComponent>,
        private configurationService: ConfigurationService,
        private cookieService: CookieService) { }

  ngOnInit (): void {
    this.configurationService.getApplicationConfiguration().subscribe((config) => {
      if (config && config.application) {
        if (config.application.name !== null) {
          this.applicationName = config.application.name
        }
      }
    }, (err) => console.log(err))
  }

  closeWelcome (): void {
    this.dialogRef.close()
    this.cookieService.put(this.welcomeBannerStatusCookieKey, 'dismiss')
  }
}
