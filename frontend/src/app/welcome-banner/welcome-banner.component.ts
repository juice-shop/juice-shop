import { Component, OnInit} from '@angular/core'
import { ConfigurationService } from '../Services/configuration.service'

@Component({
    selector: 'app-welcome-banner-component',
    templateUrl: 'welcome-banner.component.html',
    styles: [`
    .example-pizza-party {
      color: hotpink;
    }
  `],
})
export class WelcomeBannerComponent implements OnInit {
    public applicationName = 'OWASP Juice Shop'

    constructor(private configurationService: ConfigurationService) { }

    ngOnInit(): void {
        this.configurationService.getApplicationConfiguration().subscribe((config) => {
            if (config && config.application) {
                if (config.application.name !== null) {
                    this.applicationName = config.application.name
                }
            }
        }, (err) => console.log(err))
    }
 }