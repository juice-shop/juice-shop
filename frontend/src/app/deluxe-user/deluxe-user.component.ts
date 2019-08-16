import { Component, OnInit } from '@angular/core'
import { UserService } from '../Services/user.service'
import { Router } from '@angular/router'
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

  constructor (private router: Router, private userService: UserService, private cookieService: CookieService, private configurationService: ConfigurationService) { }

  ngOnInit () {
    this.configurationService.getApplicationConfiguration().subscribe((config) => {
      if (config && config.application) {
        if (config.application.name !== null) {
          this.applicationName = config.application.name
        }
      }
    },(err) => console.log(err))
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
