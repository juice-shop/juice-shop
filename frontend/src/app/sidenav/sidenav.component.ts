/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { ChallengeService } from '../Services/challenge.service'
import { Component, EventEmitter, NgZone, type OnInit, Output } from '@angular/core'
import { SocketIoService } from '../Services/socket-io.service'
import { AdministrationService } from '../Services/administration.service'
import { Router } from '@angular/router'
import { UserService } from '../Services/user.service'
import { CookieService } from 'ngx-cookie'
import { ConfigurationService } from '../Services/configuration.service'
import { LoginGuard } from '../app.guard'
import { roles } from '../roles'
import { type Observable } from 'rxjs'
import { FeatureFlagService } from '../Services/feature-flag.service'
import { map } from 'rxjs/operators'

@Component({
  selector: 'sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
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

  public scoreBoardLink$: Observable<string>

  @Output() public sidenavToggle = new EventEmitter()

  constructor (private readonly administrationService: AdministrationService, private readonly challengeService: ChallengeService,
    private readonly ngZone: NgZone, private readonly io: SocketIoService, private readonly userService: UserService, private readonly cookieService: CookieService,
    private readonly router: Router, private readonly configurationService: ConfigurationService, private readonly loginGuard: LoginGuard, private readonly featureFlagService: FeatureFlagService) { }

  ngOnInit () {
    this.administrationService.getApplicationVersion().subscribe((version: any) => {
      if (version) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        this.version = `v${version}`
      }
    }, (err) => { console.log(err) })
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
    this.scoreBoardLink$ = this.featureFlagService.defaultScoreBoard$.pipe(map((version) => version === 'v1' ? '/score-board' : '/score-board-preview'))
  }

  isLoggedIn () {
    return localStorage.getItem('token')
  }

  logout () {
    this.userService.saveLastLoginIp().subscribe((user: any) => { this.noop() }, (err) => { console.log(err) })
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
    this.challengeService.find({ name: 'Score Board' }).subscribe((challenges: any) => {
      this.ngZone.run(() => {
        this.scoreBoardVisible = challenges[0].solved
      })
    }, (err) => { console.log(err) })
  }

  getUserDetails () {
    this.userService.whoAmI().subscribe((user: any) => {
      this.userEmail = user.email
    }, (err) => { console.log(err) })
  }

  onToggleSidenav = () => {
    this.sidenavToggle.emit()
  }

  getApplicationDetails () {
    this.configurationService.getApplicationConfiguration().subscribe((config: any) => {
      if (config?.application?.name) {
        this.applicationName = config.application.name
      }
      if (config?.application) {
        this.showGitHubLink = config.application.showGitHubLinks
      }
      if (config?.application.welcomeBanner.showOnFirstStart && config.hackingInstructor.isEnabled) {
        this.offerScoreBoardTutorial = config.application.welcomeBanner.showOnFirstStart && config.hackingInstructor.isEnabled
      }
    }, (err) => { console.log(err) })
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
