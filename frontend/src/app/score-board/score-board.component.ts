import { MatTableDataSource } from '@angular/material/table'
import { DomSanitizer } from '@angular/platform-browser'
import { ChallengeService } from '../Services/challenge.service'
import { ConfigurationService } from '../Services/configuration.service'
import { Component, NgZone, OnInit } from '@angular/core'
import { SocketIoService } from '../Services/socket-io.service'
import { NgxSpinnerService } from 'ngx-spinner'

import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { faStar, faTrophy } from '@fortawesome/free-solid-svg-icons'
import { faGem } from '@fortawesome/free-regular-svg-icons'
import { faBtc, faGithub, faGitter } from '@fortawesome/free-brands-svg-icons'
import { hasInstructions, startHackingInstructorFor } from 'src/hacking-instructor'
import { Challenge } from '../Models/challenge.model'

library.add(faStar, faGem, faGitter, faGithub, faBtc, faTrophy)
dom.watch()

@Component({
  selector: 'app-score-board',
  templateUrl: './score-board.component.html',
  styleUrls: ['./score-board.component.scss']
})
export class ScoreBoardComponent implements OnInit {

  public availableDifficulties: number[] = [1, 2, 3, 4, 5, 6]
  public displayedDifficulties: number[] = []
  public availableChallengeCategories: string[] = []
  public displayedChallengeCategories: string[] = []
  public toggledMajorityOfDifficulties: boolean = false
  public toggledMajorityOfCategories: boolean = true
  public showSolvedChallenges: boolean = true
  public displayedColumns = ['name', 'difficulty', 'description', 'category', 'status']
  public offsetValue = ['100%', '100%', '100%', '100%', '100%', '100%']
  public allowRepeatNotifications: boolean = false
  public showChallengeHints: boolean = true
  public showHackingInstructor: boolean = true
  public challenges: Challenge[] = []
  public percentChallengesSolved: string = '0'
  public solvedChallengesOfDifficulty: Challenge[][] = [[], [], [], [], [], []]
  public totalChallengesOfDifficulty: Challenge[][] = [[], [], [], [], [], []]
  public showContributionInfoBox: boolean = true

  constructor (private configurationService: ConfigurationService, private challengeService: ChallengeService, private sanitizer: DomSanitizer, private ngZone: NgZone, private io: SocketIoService, private spinner: NgxSpinnerService) {
  }

  ngOnInit () {
    this.spinner.show()

    this.displayedDifficulties = localStorage.getItem('displayedDifficulties') ? JSON.parse(String(localStorage.getItem('displayedDifficulties'))) : [1]
    this.showSolvedChallenges = localStorage.getItem('showSolvedChallenges') ? JSON.parse(String(localStorage.getItem('showSolvedChallenges'))) : true

    this.configurationService.getApplicationConfiguration().subscribe((config) => {
      this.allowRepeatNotifications = config.application.showChallengeSolvedNotifications && config.ctf.showFlagsInNotifications
      this.showChallengeHints = config.application.showChallengeHints
      this.showHackingInstructor = (config.hackingInstructor && config.hackingInstructor.isEnabled) || config.application.showHackingInstructor // TODO Remove fallback with v10.0.0
      if (config.application.showGitHubLinks !== null && config.application.showGitHubLinks !== undefined) {
        this.showContributionInfoBox = config.application.showGitHubLinks
      }
    }, (err) => console.log(err))

    this.challengeService.find({ sort: 'name' }).subscribe((challenges) => {
      this.challenges = challenges
      for (let i = 0; i < this.challenges.length; i++) {
        ScoreBoardComponent.augmentHintText(this.challenges[i])
        this.trustDescriptionHtml(this.challenges[i])
        if (this.challenges[i].name === 'Score Board') {
          this.challenges[i].solved = true
        }
        if (!this.availableChallengeCategories.includes(challenges[i].category)) {
          this.availableChallengeCategories.push(challenges[i].category)
        }
      }
      this.availableChallengeCategories.sort()
      this.displayedChallengeCategories = localStorage.getItem('displayedChallengeCategories') ? JSON.parse(String(localStorage.getItem('displayedChallengeCategories'))) : this.availableChallengeCategories
      this.calculateProgressPercentage()
      this.populateFilteredChallengeLists()
      this.calculateGradientOffsets(challenges)

      this.toggledMajorityOfDifficulties = this.determineToggledMajorityOfDifficulties()
      this.toggledMajorityOfCategories = this.determineToggledMajorityOfCategories()

      this.spinner.hide()
    }, (err) => {
      this.challenges = []
      console.log(err)
    })

    this.ngZone.runOutsideAngular(() => {
      this.io.socket().on('challenge solved', (data: any) => {
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

  private static augmentHintText (challenge: Challenge) {
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

  trustDescriptionHtml (challenge: Challenge) {
    challenge.description = this.sanitizer.bypassSecurityTrustHtml(challenge.description as string)
  }

  calculateProgressPercentage () {
    let solvedChallenges = 0
    for (let i = 0; i < this.challenges.length; i++) {
      solvedChallenges += (this.challenges[i].solved) ? 1 : 0
    }
    this.percentChallengesSolved = (100 * solvedChallenges / this.challenges.length).toFixed(0)
  }

  calculateGradientOffsets (challenges: Challenge[]) {
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

  toggleDifficulty (difficulty: number) {
    if (!this.displayedDifficulties.includes(difficulty)) {
      this.displayedDifficulties.push(difficulty)
    } else {
      this.displayedDifficulties = this.displayedDifficulties.filter((c) => c !== difficulty)
    }
    localStorage.setItem('displayedDifficulties', JSON.stringify(this.displayedDifficulties))
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
    localStorage.setItem('displayedDifficulties', JSON.stringify(this.displayedDifficulties))
  }

  toggleShowSolvedChallenges () {
    this.showSolvedChallenges = !this.showSolvedChallenges
    localStorage.setItem('showSolvedChallenges', JSON.stringify(this.showSolvedChallenges))
  }

  toggleShowChallengeCategory (category: string) {
    if (!this.displayedChallengeCategories.includes(category)) {
      this.displayedChallengeCategories.push(category)
    } else {
      this.displayedChallengeCategories = this.displayedChallengeCategories.filter((c) => c !== category)
    }
    localStorage.setItem('displayedChallengeCategories', JSON.stringify(this.displayedChallengeCategories))
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
    localStorage.setItem('displayedChallengeCategories', JSON.stringify(this.displayedChallengeCategories))
  }

  determineToggledMajorityOfDifficulties () {
    return this.displayedDifficulties.length > this.availableDifficulties.length / 2
  }

  determineToggledMajorityOfCategories () {
    return this.displayedChallengeCategories.length > this.availableChallengeCategories.length / 2
  }

  filterToDataSource (challenges: Challenge[]) {
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
      if (this.challenges.length === 0) {
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

  trackById (index: number, item: any) {
    return item.id
  }
}
