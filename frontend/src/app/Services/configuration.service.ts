import { environment } from '../../environments/environment'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators'
import { Observable } from 'rxjs'

interface ConfigResponse {
  config: Config
}
interface Config {
  server: {
    port: number
  }
  application: {
    domain: string
    name: string
    logo: string
    favicon: string
    theme: string
    showChallengeSolvedNotifications: boolean
    showChallengeHints: boolean
    showVersionNumber: boolean
    showHackingInstructor: boolean
    showGitHubLinks: boolean
    numberOfRandomFakeUsers: number
    twitterUrl: string
    facebookUrl: string
    slackUrl: string
    redditUrl: string
    pressKitUrl: string
    planetOverlayMap: string
    planetName: string
    recyclePage: {
      topProductImage: string
      bottomProductImage: string
    }
    altcoinName: string
    welcomeBanner: {
      showOnFirstStart: boolean
      title: string
      message: string
    }
    cookieConsent: {
      backgroundColor: string
      textColor: string
      buttonColor: string
      buttonTextColor: string
      message: string
      dismissText: string
      linkText: string
      linkUrl: string
    }
    privacyContactEmail: string
    securityTxt: {
      contact: string
      encryption: string
      acknowledgements: string
    }
    promotion: {
      video: string
      subtitles: string
    }
  }
  challenges: {
    safetyOverride: boolean
    overwriteUrlForProductTamperingChallenge: string
  }
  products: any[]
  ctf: {
    showFlagsInNotifications: boolean
    showCountryDetailsInNotifications: string
    countryMapping: any[]
  }
}

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  private hostServer = environment.hostServer
  private host = this.hostServer + '/rest/admin'
  private configObservable: any
  constructor (private http: HttpClient) { }

  getApplicationConfiguration (): Observable<Config> {
    if (this.configObservable) {
      return this.configObservable
    } else {
      this.configObservable = this.http.get<ConfigResponse>(this.host + '/application-configuration').pipe(map((response: ConfigResponse) => response.config, catchError((err) => { throw err })))
      return this.configObservable
    }
  }
}
