/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { ChallengeService } from '../Services/challenge.service'
import { Component, EventEmitter, NgZone, type OnInit, Output } from '@angular/core'
import { SocketIoService } from '../Services/socket-io.service'
import { AdministrationService } from '../Services/administration.service'
import { Router, RouterLink } from '@angular/router'
import { UserService } from '../Services/user.service'
import { CookieService } from 'ngy-cookie'
import { ConfigurationService } from '../Services/configuration.service'
import { LoginGuard } from '../app.guard'
import { roles } from '../roles'
import { MatDivider } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { NgClass } from '@angular/common'

import { TranslateModule } from '@ngx-translate/core'
import { MatButtonModule } from '@angular/material/button'
import { MatNavList, MatListSubheaderCssMatStyler, MatListItem } from '@angular/material/list'
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar'

@Component({
  selector: 'sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  imports: [MatToolbar, MatToolbarRow, MatNavList, MatButtonModule, MatListSubheaderCssMatStyler, TranslateModule, MatListItem, RouterLink, MatIconModule, NgClass, MatDivider]
})
export class SidenavComponent implements OnInit {
  public applicationName = 'OWASP Juice Shop'
  public showGitHubLink = true
  public userEmail = ''
  public scoreBoardVisible: boolean = false
  public version: string = ''
  public showPrivacySubmenu: boolean = false
  public showOrdersSubmenu: boolean = false
  public isShowing = false
  public offerScoreBoardTutorial: boolean = false
  @Output() public sidenavToggle = new EventEmitter()

  constructor (private readonly administrationService: AdministrationService, private readonly challengeService: ChallengeService,
    private readonly ngZone: NgZone, private readonly io: SocketIoService, private readonly userService: UserService, private readonly cookieService: CookieService,
    private readonly router: Router, private readonly configurationService: ConfigurationService, private readonly loginGuard: LoginGuard) { }

  ngOnInit (): void {
    this.administrationService.getApplicationVersion().subscribe({
      next: (version: any) => {
        if (version) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          this.version = `v${version}`
        }
      },
      error: (err) => { console.log(err) }
    })
    this.getApplicationDetails()
    this.getScoreBoardStatus()

    if (localStorage.getItem('token')) {
      this.getUserDetails()
    } else {
      this.userEmail = ''
    }

    this.userService.getLoggedInState().subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        this.getUserDetails()
      } else {
        this.userEmail = ''
      }
    })
    this.ngZone.runOutsideAngular(() => {
      this.io.socket().on('challenge solved', (challenge) => {
        if (challenge.key === 'scoreBoardChallenge') {
          this.scoreBoardVisible = true
        }
      })
    })
  }

  isLoggedIn () {
    return localStorage.getItem('token')
  }

  logout () {
    this.userService.saveLastLoginIp().subscribe({ next: (user: any) => { this.noop() }, error: (err) => { console.log(err) } })
    localStorage.removeItem('token')
    this.cookieService.remove('token')
    sessionStorage.removeItem('bid')
    sessionStorage.removeItem('itemTotal')
    this.userService.isLoggedIn.next(false)
    this.ngZone.run(async () => await this.router.navigate(['/']))
  }

  goToProfilePage () {
    window.location.replace(environment.hostServer + '/profile')
  }

  goToDataErasurePage () {
    window.location.replace(environment.hostServer + '/dataerasure')
  }

  // eslint-disable-next-line no-empty,@typescript-eslint/no-empty-function
  noop () { }

  getScoreBoardStatus () {
    this.challengeService.find({ name: 'Score Board' }).subscribe({
      next: (challenges: any) => {
        this.ngZone.run(() => {
          this.scoreBoardVisible = challenges[0].solved
        })
      },
      error: (err) => { console.log(err) }
    })
  }

  getUserDetails () {
    this.userService.whoAmI().subscribe({
      next: (user: any) => {
        this.userEmail = user.email
      },
      error: (err) => { console.log(err) }
    })
  }

  onToggleSidenav = () => {
    this.sidenavToggle.emit()
  }

  getApplicationDetails () {
    this.configurationService.getApplicationConfiguration().subscribe({
      next: (config: any) => {
        if (config?.application?.name) {
          this.applicationName = config.application.name
        }
        if (config?.application) {
          this.showGitHubLink = config.application.showGitHubLinks
        }
        if (config?.application.welcomeBanner.showOnFirstStart && config.hackingInstructor.isEnabled) {
          this.offerScoreBoardTutorial = config.application.welcomeBanner.showOnFirstStart && config.hackingInstructor.isEnabled
        }
      },
      error: (err) => { console.log(err) }
    })
  }

  isAccounting () {
    const payload = this.loginGuard.tokenDecode()
    return payload?.data?.role === roles.accounting
  }

  startHackingInstructor () {
    this.onToggleSidenav()
    console.log('Starting instructions for challenge "Score Board"')
    import(/* webpackChunkName: "tutorial" */ '../../hacking-instructor').then(module => {
      module.startHackingInstructorFor('Score Board')
    })
  }
}
