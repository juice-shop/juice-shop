import { ConfigurationService } from './../Services/configuration.service'
import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'app-score-board',
  templateUrl: './score-board.component.html',
  styleUrls: ['./score-board.component.css']
})
export class ScoreBoardComponent implements OnInit {

  public scoreBoardTablesExpanded
  public displayedColumns = ['name','description','status']
  public allowRepeatNotifications
  public showChallengeHints
  constructor (private configurationService: ConfigurationService) {}

  ngOnInit () {
    this.scoreBoardTablesExpanded = localStorage.getItem('scoreBoardTablesExpanded') ? JSON.parse(localStorage.getItem('scoreBoardTablesExpanded')) : [null, true, false, false, false, false, false]

    this.configurationService.getApplicationConfiguration().subscribe((data: any) => {
      this.allowRepeatNotifications = data.application.showChallengeSolvedNotifications && data.ctf.showFlagsInNotifications
      this.showChallengeHints = data.application.showChallengeHints
    },(err) => err)
  }

  toggleDifficulty (difficulty) {
    this.scoreBoardTablesExpanded[difficulty] = !this.scoreBoardTablesExpanded[difficulty]
    localStorage.setItem('scoreBoardTablesExpanded',JSON.stringify(this.scoreBoardTablesExpanded))
  }

}
