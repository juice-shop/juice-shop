/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { ChallengeService } from '../Services/challenge.service'
import { UserService } from '../Services/user.service'
import { AdministrationService } from '../Services/administration.service'
import { ConfigurationService } from '../Services/configuration.service'
import { Component, EventEmitter, NgZone, OnInit, Output } from '@angular/core'
import { CookieService } from 'ngx-cookie-service'
import { TranslateService } from '@ngx-translate/core'
import { Router } from '@angular/router'
import { SocketIoService } from '../Services/socket-io.service'
import { LanguagesService } from '../Services/languages.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { BasketService } from '../Services/basket.service'

import {
  faBomb,
  faComment,
  faInfoCircle,
  faLanguage,
  faMapMarker,
  faRecycle,
  faSearch,
  faShoppingCart,
  faSignInAlt,
  faSignOutAlt,
  faThermometerEmpty,
  faThermometerFull,
  faThermometerHalf,
  faThermometerQuarter,
  faThermometerThreeQuarters,
  faTrophy,
  faUserCircle,
  faUserSecret
} from '@fortawesome/free-solid-svg-icons'
import { faComments } from '@fortawesome/free-regular-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { LoginGuard } from '../app.guard'
import { roles } from '../roles'

library.add(faLanguage, faSearch, faSignInAlt, faSignOutAlt, faComment, faBomb, faTrophy, faInfoCircle, faShoppingCart, faUserSecret, faRecycle, faMapMarker, faUserCircle, faGithub, faComments, faThermometerEmpty, faThermometerQuarter, faThermometerHalf, faThermometerThreeQuarters, faThermometerFull)
dom.watch()

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  public userEmail: string = ''
  public languages: any = []
  public selectedLanguage: string = 'placeholder'
  public version: string = ''
  public applicationName: string = 'OWASP Juice Shop'
  public showGitHubLink: boolean = true
  public logoSrc: string = 'assets/public/images/JuiceShop_Logo.png'
  public scoreBoardVisible: boolean = false
  public shortKeyLang: string = 'placeholder'
  public itemTotal = 0

  @Output() public sidenavToggle = new EventEmitter()

  constructor (private readonly administrationService: AdministrationService, private readonly challengeService: ChallengeService,
    private readonly configurationService: ConfigurationService, private readonly userService: UserService, private readonly ngZone: NgZone,
    private readonly cookieService: CookieService, private readonly router: Router, private readonly translate: TranslateService,
    private readonly io: SocketIoService, private readonly langService: LanguagesService, private readonly loginGuard: LoginGuard,
    private readonly snackBar: MatSnackBar, private readonly basketService: BasketService) { }

  ngOnInit () {
    this.getLanguages()
    this.basketService.getItemTotal().subscribe(x => this.itemTotal = x)
    this.administrationService.getApplicationVersion().subscribe((version: any) => {
      if (version) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        this.version = `v${version}`
      }
    }, (err) => console.log(err))

    this.configurationService.getApplicationConfiguration().subscribe((config: any) => {
      if (config?.application?.name) {
        this.applicationName = config.application.name
      }
      if (config?.application) {
        this.showGitHubLink = config.application.showGitHubLinks
      }

      if (config?.application?.logo) {
        let logo: string = config.application.logo

        if (logo.substring(0, 4) === 'http') {
          logo = decodeURIComponent(logo.substring(logo.lastIndexOf('/') + 1))
        }
        this.logoSrc = 'assets/public/images/' + logo
      }
    }, (err) => console.log(err))

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

    this.getScoreBoardStatus()

    this.ngZone.runOutsideAngular(() => {
      this.io.socket().on('challenge solved', (challenge) => {
        if (challenge.key === 'scoreBoardChallenge') {
          this.scoreBoardVisible = true
        }
      })
    })
  }

  checkLanguage () {
    if (this.cookieService.get('language')) {
      const langKey = this.cookieService.get('language')
      this.translate.use(langKey)
      this.selectedLanguage = this.languages.find((y: { key: string }) => y.key === langKey)
      this.shortKeyLang = this.languages.find((y: { key: string }) => y.key === langKey).shortKey
    } else {
      this.changeLanguage('en')
      this.selectedLanguage = this.languages.find((y: { key: string }) => y.key === 'en')
      this.shortKeyLang = this.languages.find((y: { key: string }) => y.key === 'en').shortKey
    }
  }

  search (value: string) {
    if (value) {
      const queryParams = { queryParams: { q: value } }
      this.ngZone.run(async () => await this.router.navigate(['/search'], queryParams))
    } else {
      this.ngZone.run(async () => await this.router.navigate(['/search']))
    }
  }

  getUserDetails () {
    this.userService.whoAmI().subscribe((user: any) => {
      this.userEmail = user.email
    }, (err) => console.log(err))
  }

  isLoggedIn () {
    return localStorage.getItem('token')
  }

  logout () {
    this.userService.saveLastLoginIp().subscribe((user: any) => { this.noop() }, (err) => console.log(err))
    localStorage.removeItem('token')
    this.cookieService.delete('token', '/')
    sessionStorage.removeItem('bid')
    sessionStorage.removeItem('itemTotal')
    this.userService.isLoggedIn.next(false)
    this.ngZone.run(async () => await this.router.navigate(['/']))
  }

  changeLanguage (langKey: string) {
    this.translate.use(langKey)
    const expires = new Date()
    expires.setFullYear(expires.getFullYear() + 1)
    this.cookieService.set('language', langKey, expires, '/')
    if (this.languages.find((y: { key: string }) => y.key === langKey)) {
      const language = this.languages.find((y: { key: string }) => y.key === langKey)
      this.shortKeyLang = language.shortKey
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      const snackBarRef = this.snackBar.open(`Language has been changed to ${language.lang}`, 'Force page reload', {
        duration: 5000
      })
      snackBarRef.onAction().subscribe(() => {
        location.reload()
      })
    }
  }

  getScoreBoardStatus () {
    this.challengeService.find({ name: 'Score Board' }).subscribe((challenges: any) => {
      this.ngZone.run(() => {
        this.scoreBoardVisible = challenges[0].solved
      })
    }, (err) => console.log(err))
  }

  goToProfilePage () {
    window.location.replace(environment.hostServer + '/profile')
  }

  onToggleSidenav = () => {
    this.sidenavToggle.emit()
  }

  // eslint-disable-next-line no-empty,@typescript-eslint/no-empty-function
  noop () { }

  getLanguages () {
    this.langService.getLanguages().subscribe((res) => {
      this.languages = res
      this.checkLanguage()
    })
  }

  isAccounting () {
    const payload = this.loginGuard.tokenDecode()
    return payload?.data && payload.data.role === roles.accounting
  }
}
