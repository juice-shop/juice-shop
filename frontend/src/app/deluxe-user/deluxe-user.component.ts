/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { Component, NgZone, OnInit } from '@angular/core'
import { UserService } from '../Services/user.service'
import { ActivatedRoute, Router } from '@angular/router'
import { CookieService } from 'ngx-cookie-service'
import { ConfigurationService } from '../Services/configuration.service'
import { SocketIoService } from '../Services/socket-io.service'

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

  constructor (private router: Router, private userService: UserService, private cookieService: CookieService, private configurationService: ConfigurationService, private route: ActivatedRoute, private ngZone: NgZone, private io: SocketIoService) {
  }

  ngOnInit () {
    this.configurationService.getApplicationConfiguration().subscribe((config) => {
      let decalParam = this.route.snapshot.queryParams.testDecal // "Forgotten" test parameter to play with different stickers on the delivery box image
      if (config && config.application) {
        if (config.application.name) {
          this.applicationName = config.application.name
        }
        if (config.application.logo) {
          let logo: string = config.application.logo

          if (logo.substring(0, 4) === 'http') {
            logo = decodeURIComponent(logo.substring(logo.lastIndexOf('/') + 1))
          }
          this.logoSrc = 'assets/public/images/' + (decalParam ? decalParam : logo)
        }
      }
      if (decalParam) {
        this.ngZone.runOutsideAngular(() => {
          this.io.socket().emit('verifySvgInjectionChallenge', decalParam)
        })
      }
    }, (err) => console.log(err))
    this.userService.deluxeStatus().subscribe((res) => {
      this.membershipCost = res.membershipCost
    }, (err) => {
      this.error = err.error.error
    })
  }

  upgradeToDeluxe () {
    this.ngZone.run(() => this.router.navigate(['/payment', 'deluxe']))
  }
}
