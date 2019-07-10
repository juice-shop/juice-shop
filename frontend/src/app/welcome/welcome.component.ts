import { Component, OnInit } from '@angular/core'
import { ConfigurationService } from '../Services/configuration.service'
import { MatDialog } from '@angular/material'
import { WelcomeBannerComponent } from '../welcome-banner/welcome-banner.component'
import { CookieService } from 'ngx-cookie'

@Component({
  selector: 'app-welcome',
  templateUrl: 'welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})

export class WelcomeComponent implements OnInit {

  private readonly welcomeBannerStatusCookieKey = 'welcomebanner_status'

  constructor (private dialog: MatDialog, private configurationService: ConfigurationService, private cookieService: CookieService) { }

  ngOnInit (): void {
    let welcomeBannerStatus = this.cookieService.get(this.welcomeBannerStatusCookieKey)
    if (welcomeBannerStatus === 'dismiss') {
      return
    } else {
      this.configurationService.getApplicationConfiguration().subscribe((config: any) => {
        if (config && config.application && config.application.welcomeBanner && !config.application.welcomeBanner.showOnFirstStart) {
          return
        }
        this.dialog.open(WelcomeBannerComponent, {
          minWidth: '320px',
          width: '35%',
          position: {
            top: '50px'
          }
        })
      }, (err) => console.log(err))
    }
  }
}
