/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

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
    showVersionNumber: boolean
    showGitHubLinks: boolean
    localBackupEnabled: boolean
    numberOfRandomFakeUsers: number
    altcoinName: string
    privacyContactEmail: string
    social: {
      twitterUrl: string
      facebookUrl: string
      slackUrl: string
      redditUrl: string
      pressKitUrl: string
      questionnaireUrl: string
    }
    recyclePage: {
      topProductImage: string
      bottomProductImage: string
    }
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
    securityTxt: {
      contact: string
      encryption: string
      acknowledgements: string
    }
    promotion: {
      video: string
      subtitles: string
    }
    easterEggPlanet: {
      name: string
      overlayMap: string
    }
    googleOauth: {
      clientId: string
      authorizedRedirects: any[]
    }
  }
  challenges: {
    showSolvedNotifications: boolean
    showHints: boolean
    showMitigations: boolean
    restrictToTutorialsFirst: boolean
    safetyOverride: boolean
    overwriteUrlForProductTamperingChallenge: string
  }
  hackingInstructor: {
    isEnabled: boolean
    avatarImage: string
  }
  products: any[]
  memories: any[]
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
