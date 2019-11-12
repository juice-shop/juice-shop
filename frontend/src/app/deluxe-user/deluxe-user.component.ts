import { Component, OnInit } from '@angular/core'
import { UserService } from '../Services/user.service'
import { ActivatedRoute, Router } from '@angular/router'
import { CookieService } from 'ngx-cookie'
import { ConfigurationService } from '../Services/configuration.service'

@Component({
  selector: 'app-deluxe-user',
  templateUrl: './deluxe-user.component.html',
  styleUrls: ['./deluxe-user.component.scss']
})

export class DeluxeUserComponent implements OnInit {

  public membershipCost: Number = 0
  public error: string = undefined
  public applicationName = 'OWASP Juice Shop'
  public logoSrc: string = 'assets/public/images/JuiceShop_Logo.png'

  constructor (private router: Router, private userService: UserService, private cookieService: CookieService, private configurationService: ConfigurationService, private route: ActivatedRoute) {
  }

  ngOnInit () {
    this.configurationService.getApplicationConfiguration().subscribe((config) => {
      if (config && config.application) {
        if (config.application.name !== null) {
          this.applicationName = config.application.name
        }
        if (config.application.logo !== null) {
          let logo: string = config.application.logo

          if (logo.substring(0, 4) === 'http') {
            logo = decodeURIComponent(logo.substring(logo.lastIndexOf('/') + 1))
          }
          this.logoSrc = 'assets/public/images/' + (this.route.snapshot.queryParams.decal ? this.route.snapshot.queryParams.decal : logo)
        }
      } else {
        this.logoSrc = 'assets/public/images/' + (this.route.snapshot.queryParams.decal ? this.route.snapshot.queryParams.decal : 'JuiceShop_Logo.png')
      }
    }, (err) => console.log(err))
    this.userService.deluxeStatus().subscribe((res) => {
      this.membershipCost = res.membershipCost
    }, (err) => {
      this.error = err.error.error
    })
  }

  upgradeToDeluxe () {
    this.router.navigate(['/payment', 'deluxe'])
  }
}
