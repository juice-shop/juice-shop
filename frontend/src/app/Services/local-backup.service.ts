import { Injectable } from '@angular/core'
import { Backup } from '../Models/backup.model'
import { CookieService } from 'ngx-cookie-service'

@Injectable({
  providedIn: 'root'
})
export class LocalBackupService {

  constructor (private cookieService: CookieService) { }

  save () {
    const backup: Backup = { }

    backup.scoreBoard = {
      displayedDifficulties: localStorage.getItem('displayedDifficulties'),
      showSolvedChallenges: localStorage.getItem('showSolvedChallenges'),
      showDisabledChallenges: localStorage.getItem('showDisabledChallenges'),
      showOnlyTutorialChallenges: localStorage.getItem('showOnlyTutorialChallenges'),
      displayedChallengeCategories: localStorage.getItem('displayedChallengeCategories')
    }
    backup.banners = {
      welcomeBannerStatus: this.cookieService.get('welcomebanner_status'),
      cookieConsentStatus: this.cookieService.get('cookieconsent_status')
    }
    backup.language = this.cookieService.get('language')
    backup.continueCode = this.cookieService.get('continueCode')

    return JSON.stringify(backup)
  }

  restore (backupData: string) {
    const backup: Backup = JSON.parse(backupData)

    localStorage.setItem('displayedDifficulties', JSON.stringify(backup.scoreBoard.displayedDifficulties))
    localStorage.setItem('showSolvedChallenges', JSON.stringify(backup.scoreBoard.showSolvedChallenges))
    localStorage.setItem('showDisabledChallenges', JSON.stringify(backup.scoreBoard.showDisabledChallenges))
    localStorage.setItem('showOnlyTutorialChallenges', JSON.stringify(backup.scoreBoard.showOnlyTutorialChallenges))
    localStorage.setItem('displayedChallengeCategories', JSON.stringify(backup.scoreBoard.displayedChallengeCategories))
    let expires = new Date()
    expires.setFullYear(expires.getFullYear() + 1)
    this.cookieService.set('welcomebanner_status', JSON.stringify(backup.banners.welcomeBannerStatus), expires, '/')
    this.cookieService.set('cookieconsent_status', JSON.stringify(backup.banners.cookieConsentStatus), expires, '/')
    this.cookieService.set('language', JSON.stringify(backup.language), expires, '/')
    this.cookieService.set('continueCode', JSON.stringify(backup.continueCode), expires, '/')
  }
}
