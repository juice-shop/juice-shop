import { WindowRefService } from '../Services/window-ref.service'
import { MatTableDataSource } from '@angular/material/table'
import { DomSanitizer } from '@angular/platform-browser'
import { ChallengeService } from '../Services/challenge.service'
import { ConfigurationService } from '../Services/configuration.service'
import { Component, NgZone, OnInit } from '@angular/core'
import { SocketIoService } from '../Services/socket-io.service'

import fontawesome from '@fortawesome/fontawesome'
import { faBook, faStar, faTrophy } from '@fortawesome/fontawesome-free-solid'
import { faFlag, faGem } from '@fortawesome/fontawesome-free-regular'
import { faGithub, faGitter, faDocker, faBtc } from '@fortawesome/fontawesome-free-brands'

fontawesome.library.add(faBook, faStar, faFlag, faGem, faGitter, faGithub, faDocker, faBtc, faTrophy)

@Component({
  selector: 'app-score-board',
  templateUrl: './score-board.component.html',
  styleUrls: ['./score-board.component.scss']
})
export class ScoreBoardComponent implements OnInit {

  public scoreBoardTablesExpanded
  public showSolvedChallenges
  public displayedColumns = ['name','description','status']
  public offsetValue = ['100%', '100%', '100%', '100%', '100%', '100%']
  public allowRepeatNotifications
  public showChallengeHints
  public challenges: any[]
  public percentChallengesSolved

  constructor (private configurationService: ConfigurationService,private challengeService: ChallengeService,private windowRefService: WindowRefService,private sanitizer: DomSanitizer, private ngZone: NgZone, private io: SocketIoService) {}

  ngOnInit () {
    this.scoreBoardTablesExpanded = localStorage.getItem('scoreBoardTablesExpanded') ? JSON.parse(localStorage.getItem('scoreBoardTablesExpanded')) : [null, true, false, false, false, false, false]
    this.showSolvedChallenges = localStorage.getItem('showSolvedChallenges') ? JSON.parse(localStorage.getItem('showSolvedChallenges')) : true

    this.configurationService.getApplicationConfiguration().subscribe((data: any) => {
      this.allowRepeatNotifications = data.application.showChallengeSolvedNotifications && data.ctf.showFlagsInNotifications
      this.showChallengeHints = data.application.showChallengeHints
    },(err) => console.log(err))

    this.challengeService.find().subscribe((challenges) => {
      this.challenges = challenges
      for (let i = 0; i < this.challenges.length; i++) {
        if (this.challenges[i].hintUrl) {
          if (this.challenges[i].hint) {
            this.challenges[i].hint += ' Click for more hints.'
          } else {
            this.challenges[i].hint = 'Click to open hints.'
          }
        }
        if (this.challenges[i].disabledEnv) {
          this.challenges[i].hint = 'This challenge is unavailable in a ' + this.challenges[i].disabledEnv + ' environment!'
        }
        if (this.challenges[i].name === 'Score Board') {
          this.challenges[i].solved = true
        }
      }
      this.trustDescriptionHtml()
      this.calculateProgressPercentage()
      this.setOffset(challenges)
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
          this.setOffset(this.challenges)
        }
      })
    })
  }

  trustDescriptionHtml () {
    for (let i = 0; i < this.challenges.length; i++) {
      this.challenges[i].description = this.sanitizer.bypassSecurityTrustHtml(this.challenges[i].description)
    }
  }

  calculateProgressPercentage () {
    let solvedChallenges = 0
    for (let i = 0; i < this.challenges.length; i++) {
      solvedChallenges += (this.challenges[i].solved) ? 1 : 0
    }
    this.percentChallengesSolved = (100 * solvedChallenges / this.challenges.length).toFixed(0)
  }

  setOffset (challenges) {
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
    this.scoreBoardTablesExpanded[difficulty] = !this.scoreBoardTablesExpanded[difficulty]
    localStorage.setItem('scoreBoardTablesExpanded',JSON.stringify(this.scoreBoardTablesExpanded))
  }

  toggleShowSolvedChallenges () {
    this.showSolvedChallenges = !this.showSolvedChallenges
    localStorage.setItem('showSolvedChallenges', JSON.stringify(this.showSolvedChallenges))
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

  filterToDataSource (challenges,difficulty,key) {
    if (!challenges) {
      return []
    }

    challenges = challenges.filter((challenge) => challenge.difficulty === difficulty)
    if (!this.showSolvedChallenges) {
      challenges = challenges.filter((challenge) => !challenge.solved)
    }
    challenges = challenges.sort((challenge1: any, challenge2: any) => {
      let x = challenge1[key]
      let y = challenge2[key]
      return ((x < y) ? -1 : ((x > y) ? 1 : 0))
    })

    let dataSource = new MatTableDataSource()
    dataSource.data = challenges
    return dataSource
  }

  filterChallengesByDifficulty (difficulty) {
    if (!this.challenges) {
      return []
    }
    return this.challenges.filter((challenge) => challenge.difficulty === difficulty)
  }

  filterSolvedChallengesOfDifficulty (difficulty) {
    if (!this.challenges) {
      return []
    }
    return this.challenges.filter((challenge) => challenge.difficulty === difficulty && challenge.solved === true)
  }
}
