import { UserService } from './../Services/user.service'
import { AdministrationService } from './../Services/administration.service'
import { ConfigurationService } from './../Services/configuration.service'
import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { languages } from './languages'
import { faSearch, faSignInAlt, faComment, faBomb, faTrophy, faInfoCircle, faShoppingCart, faUserSecret, faRecycle, faMapMarker, faUserCircle, faFlask, faLanguage } from '@fortawesome/fontawesome-free-solid'
import fontawesome from '@fortawesome/fontawesome'
fontawesome.library.add(faLanguage, faFlask, faSearch, faSignInAlt, faComment, faBomb, faTrophy, faInfoCircle, faShoppingCart, faUserSecret, faRecycle, faMapMarker, faUserCircle)

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  public userEmail = ''
  public languages = languages
  public selectedLanguage = 'English'
  public version = ''
  public applicationName = 'OWASP Juice Shop'
  public gitHubRibbon = 'orange'
  public logoSrc = 'assets/public/images/JuiceShop_Logo.svg'

  constructor (private administrationService: AdministrationService,
    private configurationService: ConfigurationService,private userService: UserService,
    private router: Router) { }

  ngOnInit () {

    this.administrationService.getApplicationVersion().subscribe((version: any) => {
      if (version) {
        this.version = 'v' + version
      }
    })

    this.configurationService.getApplicationConfiguration().subscribe((config: any) => {
      if (config && config.application && config.application.name !== null) {
        this.applicationName = config.application.name
      }
      if (config && config.application && config.application.gitHubRibbon !== null) {
        this.gitHubRibbon = config.application.gitHubRibbon !== 'none' ? config.application.gitHubRibbon : null
      }

      let logo: string = config.application.logo

      if (logo.substring(0, 4) === 'http') {
        logo = decodeURIComponent(logo.substring(logo.lastIndexOf('/') + 1))
        this.logoSrc = 'assets/public/images/' + logo
      }
    })

    this.userService.getLoggedInState().subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        this.updateUserEmail()
      } else {
        this.userEmail = ''
      }
    })
  }

  search (value: string) {
    if (value) {
      const queryParams = { queryParams: { q: value } }
      this.router.navigate(['/search'], queryParams)
    } else {
      this.router.navigate(['/search'])
    }
  }

  updateUserEmail () {
    this.userService.whoAmI().subscribe((user: any) => {
      this.userEmail = user.email
    },(err) => console.log(err))
  }

  isLoggedIn () {
    return localStorage.getItem('token')
  }

  logout () {
    localStorage.removeItem('token')
    delete sessionStorage.bid
    this.userService.isLoggedIn.next(false)
    this.router.navigate(['/'])
  }

}
