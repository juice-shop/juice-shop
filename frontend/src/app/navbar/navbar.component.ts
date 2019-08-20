import { ChallengeService } from '../Services/challenge.service'
import { UserService } from '../Services/user.service'
import { AdministrationService } from '../Services/administration.service'
import { ConfigurationService } from '../Services/configuration.service'
import { Component, NgZone, OnInit, EventEmitter, Output } from '@angular/core'
import { CookieService } from 'ngx-cookie'
import { TranslateService } from '@ngx-translate/core'
import { Router } from '@angular/router'
import { SocketIoService } from '../Services/socket-io.service'
import { LanguagesService } from '../Services/languages.service'

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
  faTrophy,
  faUserCircle,
  faUserSecret,
  faThermometerEmpty,
  faThermometerQuarter,
  faThermometerHalf,
  faThermometerThreeQuarters,
  faThermometerFull
} from '@fortawesome/free-solid-svg-icons'
import { faComments } from '@fortawesome/free-regular-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { AdminGuard } from '../app.guard'
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

  @Output() public sidenavToggle = new EventEmitter()

  constructor (private administrationService: AdministrationService, private challengeService: ChallengeService,
    private configurationService: ConfigurationService, private userService: UserService, private ngZone: NgZone,
    private cookieService: CookieService, private router: Router, private translate: TranslateService, private io: SocketIoService, private langService: LanguagesService, private adminGuard: AdminGuard) { }

  ngOnInit () {
    this.getLanguages()
    this.administrationService.getApplicationVersion().subscribe((version: any) => {
      if (version) {
        this.version = 'v' + version
      }
    }, (err) => console.log(err))

    this.configurationService.getApplicationConfiguration().subscribe((config: any) => {
      if (config && config.application && config.application.name && config.application.name !== null) {
        this.applicationName = config.application.name
      }
      if (config && config.application && config.application.showGitHubLinks !== null) {
        this.showGitHubLink = config.application.showGitHubLinks
      }

      if (config && config.application && config.application.logo && config.application.logo !== null) {
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
      this.router.navigate(['/search'], queryParams)
    } else {
      this.router.navigate(['/search'])
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
    this.cookieService.remove('token')
    sessionStorage.removeItem('bid')
    this.userService.isLoggedIn.next(false)
    this.router.navigate(['/'])
  }

  changeLanguage (langKey: string) {
    this.translate.use(langKey)
    let expires = new Date()
    expires.setFullYear(expires.getFullYear() + 1)
    this.cookieService.put('language', langKey, { expires })
    if (this.languages.find((y: { key: string }) => y.key === langKey)) {
      this.shortKeyLang = this.languages.find((y: { key: string }) => y.key === langKey).shortKey
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
    window.location.replace('/profile')
  }

  onToggleSidenav = () => {
    this.sidenavToggle.emit()
  }

  // tslint:disable-next-line:no-empty
  noop () { }

  getLanguages () {
    this.langService.getLanguages().subscribe((res) => {
      this.languages = res
      this.checkLanguage()
    })
  }

  isAccounting () {
    const payload = this.adminGuard.tokenDecode()
    if (payload && payload.data && payload.data.role === roles.accounting) {
      return true
    } else {
      return false
    }
  }
}
