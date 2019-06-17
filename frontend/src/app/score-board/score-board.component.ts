import { WindowRefService } from '../Services/window-ref.service'
import { MatTableDataSource } from '@angular/material/table'
import { DomSanitizer } from '@angular/platform-browser'
import { ChallengeService } from '../Services/challenge.service'
import { ConfigurationService } from '../Services/configuration.service'
import { Component, NgZone, OnInit } from '@angular/core'
import { SocketIoService } from '../Services/socket-io.service'
import { NgxSpinnerService } from 'ngx-spinner'

import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faBook, faStar, faTrophy, faGraduationCap } from '@fortawesome/free-solid-svg-icons'
import { faFlag, faGem } from '@fortawesome/free-regular-svg-icons'
import { faGithub, faGitter, faDocker, faBtc } from '@fortawesome/free-brands-svg-icons'
import { hasInstructions, startHackingInstructorFor } from 'src/hacking-instructor'

library.add(faBook, faStar, faFlag, faGem, faGitter, faGithub, faDocker, faBtc, faTrophy, faGraduationCap)
dom.watch()

@Component({
  selector: 'app-score-board',
  templateUrl: './score-board.component.html',
  styleUrls: ['./score-board.component.scss']
})
export class ScoreBoardComponent implements OnInit {

  public availableDifficulties = [1,2,3,4,5,6]
  public displayedDifficulties = []
  public availableChallengeCategories = []
  public displayedChallengeCategories = []
  public toggledMajorityOfDifficulties: boolean
  public toggledMajorityOfCategories: boolean
  public showSolvedChallenges
  public displayedColumns = ['name','difficulty','description','category','status']
  public offsetValue = ['100%', '100%', '100%', '100%', '100%', '100%']
  public allowRepeatNotifications
  public showChallengeHints
  public showHackingInstructor: boolean
  public challenges: any[]
  public percentChallengesSolved
  public solvedChallengesOfDifficulty = [[], [], [], [], [], []]
  public totalChallengesOfDifficulty = [[], [], [], [], [], []]
  public showContributionInfoBox = true

  constructor (private configurationService: ConfigurationService,private challengeService: ChallengeService,private windowRefService: WindowRefService,private sanitizer: DomSanitizer, private ngZone: NgZone, private io: SocketIoService, private spinner: NgxSpinnerService) {}

  ngOnInit () {
    this.spinner.show()

    this.displayedDifficulties = localStorage.getItem('displayedDifficulties') ? JSON.parse(localStorage.getItem('displayedDifficulties')) : [1]
    this.showSolvedChallenges = localStorage.getItem('showSolvedChallenges') ? JSON.parse(localStorage.getItem('showSolvedChallenges')) : true

    this.configurationService.getApplicationConfiguration().subscribe((data: any) => {
      this.allowRepeatNotifications = data.application.showChallengeSolvedNotifications && data.ctf.showFlagsInNotifications
      this.showChallengeHints = data.application.showChallengeHints
      this.showHackingInstructor = data.application.showHackingInstructor
      if (data.application.showGitHubLinks !== null && data.application.showGitHubLinks !== undefined) {
        this.showContributionInfoBox = data.application.showGitHubLinks
      }
    },(err) => console.log(err))

    this.challengeService.find({ sort: 'name' }).subscribe((challenges) => {
      this.challenges = challenges
      for (let i = 0; i < this.challenges.length; i++) {
        this.augmentHintText(this.challenges[i])
        this.trustDescriptionHtml(this.challenges[i])
        if (this.challenges[i].name === 'Score Board') {
          this.challenges[i].solved = true
        }
        if (!this.availableChallengeCategories.includes(challenges[i].category)) {
          this.availableChallengeCategories.push(challenges[i].category)
        }
      }
      this.availableChallengeCategories.sort()
      this.displayedChallengeCategories = localStorage.getItem('displayedChallengeCategories') ? JSON.parse(localStorage.getItem('displayedChallengeCategories')) : this.availableChallengeCategories
      this.calculateProgressPercentage()
      this.populateFilteredChallengeLists()
      this.calculateGradientOffsets(challenges)

      this.toggledMajorityOfDifficulties = this.determineToggledMajorityOfDifficulties()
      this.toggledMajorityOfCategories = this.determineToggledMajorityOfCategories()

      this.spinner.hide()
    },(err) => {
      this.challenges = undefined
      console.log(err)
    })

    this.ngZone.runOutsideAngular(() => {
      this.io.socket().on('challenge solved', (data) => {
        if (data && data.challenge) {
          for (let i = 0; i < this.challenges.length; i++) {
            if (this.challenges[i].name === data.name) {
              this.challenges[i].solved = true
              break
            }
          }
          this.calculateProgressPercentage()
          this.populateFilteredChallengeLists()
          this.calculateGradientOffsets(this.challenges)
        }
      })
    })
  }

  private augmentHintText (challenge) {
    if (challenge.disabledEnv) {
      challenge.hint = 'This challenge is unavailable in a ' + challenge.disabledEnv + ' environment!'
    } else if (challenge.hintUrl) {
      if (challenge.hint) {
        challenge.hint += ' Click for more hints.'
      } else {
        challenge.hint = 'Click to open hints.'
      }
    }
  }

  trustDescriptionHtml (challenge) {
    challenge.description = this.sanitizer.bypassSecurityTrustHtml(challenge.description)
  }

  calculateProgressPercentage () {
    let solvedChallenges = 0
    for (let i = 0; i < this.challenges.length; i++) {
      solvedChallenges += (this.challenges[i].solved) ? 1 : 0
    }
    this.percentChallengesSolved = (100 * solvedChallenges / this.challenges.length).toFixed(0)
  }

  calculateGradientOffsets (challenges) {
    for (let difficulty = 1; difficulty <= 6; difficulty++) {
      let solved = 0
      let total = 0

      for (let i = 0; i < challenges.length; i++) {
        if (challenges[i].difficulty === difficulty) {
          total++
          if (challenges[i].solved) {
            solved++
          }
        }
      }

      let offset: any = Math.round(solved * 100 / total)
      offset = 100 - offset
      offset = +offset + '%'
      this.offsetValue[difficulty - 1] = offset
    }
  }

  toggleDifficulty (difficulty) {
    if (!this.displayedDifficulties.includes(difficulty)) {
      this.displayedDifficulties.push(difficulty)
    } else {
      this.displayedDifficulties = this.displayedDifficulties.filter((c) => c !== difficulty)
    }
    localStorage.setItem('displayedDifficulties',JSON.stringify(this.displayedDifficulties))
    this.toggledMajorityOfDifficulties = this.determineToggledMajorityOfDifficulties()
  }

  toggleAllDifficulty () {
    if (this.toggledMajorityOfDifficulties) {
      this.displayedDifficulties = []
      this.toggledMajorityOfDifficulties = false
    } else {
      this.displayedDifficulties = this.availableDifficulties
      this.toggledMajorityOfDifficulties = true
    }
    localStorage.setItem('displayedDifficulties',JSON.stringify(this.displayedDifficulties))
  }

  toggleShowSolvedChallenges () {
    this.showSolvedChallenges = !this.showSolvedChallenges
    localStorage.setItem('showSolvedChallenges', JSON.stringify(this.showSolvedChallenges))
  }

  toggleShowChallengeCategory (category) {
    if (!this.displayedChallengeCategories.includes(category)) {
      this.displayedChallengeCategories.push(category)
    } else {
      this.displayedChallengeCategories = this.displayedChallengeCategories.filter((c) => c !== category)
    }
    localStorage.setItem('displayedChallengeCategories',JSON.stringify(this.displayedChallengeCategories))
    this.toggledMajorityOfCategories = this.determineToggledMajorityOfCategories()
  }

  toggleAllChallengeCategory () {
    if (this.toggledMajorityOfCategories) {
      this.displayedChallengeCategories = []
      this.toggledMajorityOfCategories = false
    } else {
      this.displayedChallengeCategories = this.availableChallengeCategories
      this.toggledMajorityOfCategories = true
    }
    localStorage.setItem('displayedChallengeCategories',JSON.stringify(this.displayedChallengeCategories))
  }

  determineToggledMajorityOfDifficulties () {
    return this.displayedDifficulties.length > this.availableDifficulties.length / 2
  }

  determineToggledMajorityOfCategories () {
    return this.displayedChallengeCategories.length > this.availableChallengeCategories.length / 2
  }

  repeatNotification (challenge) {
    if (this.allowRepeatNotifications) {
      this.challengeService.repeatNotification(encodeURIComponent(challenge.name)).subscribe(() => {
        this.windowRefService.nativeWindow.scrollTo(0, 0)
      },(err) => console.log(err))
    }
  }

  openHint (challenge) {
    if (this.showChallengeHints && challenge.hintUrl) {
      this.windowRefService.nativeWindow.open(challenge.hintUrl, '_blank')
    }
  }

  filterToDataSource (challenges) {
    if (!challenges) {
      return []
    }

    challenges = challenges.filter((challenge) => {
      if (!this.displayedDifficulties.includes(challenge.difficulty)) return false
      if (!this.displayedChallengeCategories.includes(challenge.category)) return false
      if (!this.showSolvedChallenges && challenge.solved) return false
      return true
    })

    let dataSource = new MatTableDataSource()
    dataSource.data = challenges
    return dataSource
  }

  populateFilteredChallengeLists () {
    for (const difficulty of this.availableDifficulties) {
      if (!this.challenges) {
        this.totalChallengesOfDifficulty[difficulty - 1] = []
        this.solvedChallengesOfDifficulty[difficulty - 1] = []
      } else {
        this.totalChallengesOfDifficulty[difficulty - 1] = this.challenges.filter((challenge) => challenge.difficulty === difficulty)
        this.solvedChallengesOfDifficulty[difficulty - 1] = this.challenges.filter((challenge) => challenge.difficulty === difficulty && challenge.solved === true)
      }
    }
  }

  hasHackingInstructorInstructions (challengeName: String): boolean {
    return hasInstructions(challengeName)
  }

  startHackingInstructor (challengeName: String) {
    console.log(`Starting instructions for challenge "${challengeName}"`)
    startHackingInstructorFor(challengeName)
  }

  trackById (index, item) {
    return item.id
  }

  // tslint:disable-next-line:no-empty
  noop () { }
}
