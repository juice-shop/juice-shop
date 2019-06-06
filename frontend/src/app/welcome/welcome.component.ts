import { Component, OnInit } from '@angular/core'
import { ConfigurationService } from '../Services/configuration.service'
import { MatSnackBar } from '@angular/material'
import { WelcomeBannerComponent } from '../welcome-banner/welcome-banner.component'

@Component({
  selector: 'app-welcome',
  templateUrl: 'welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})

export class WelcomeComponent implements OnInit {
  constructor (private snackBar: MatSnackBar, private configurationService: ConfigurationService) { }

  ngOnInit (): void {
    this.configurationService.getApplicationConfiguration().subscribe((config: any) => {
      if (config && config.application && config.application.hideWelcome) {
        return
      }
      this.snackBar.openFromComponent(WelcomeBannerComponent, {
        verticalPosition: 'top'
      })
    }, (err) => console.log(err))
  }
}
