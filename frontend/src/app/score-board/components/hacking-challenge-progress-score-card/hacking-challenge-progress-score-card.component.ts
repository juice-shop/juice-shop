import { Component, Input, type OnChanges, type OnInit } from '@angular/core'
import { type EnrichedChallenge } from '../../types/EnrichedChallenge'
import { TranslateModule } from '@ngx-translate/core'
import { ScoreCardComponent } from '../score-card/score-card.component'

@Component({
  selector: 'hacking-challenge-progress-score-card',
  templateUrl: './hacking-challenge-progress-score-card.component.html',
  styleUrls: ['./hacking-challenge-progress-score-card.component.scss'],
  imports: [ScoreCardComponent, TranslateModule]
})
export class HackingChallengeProgressScoreCardComponent implements OnInit, OnChanges {
  @Input()
  public allChallenges: EnrichedChallenge[] = []

  public solvedChallenges: number

  ngOnInit (): void {
    this.updatedNumberOfSolvedChallenges()
  }

  ngOnChanges (): void {
    this.updatedNumberOfSolvedChallenges()
  }

  private updatedNumberOfSolvedChallenges (): void {
    this.solvedChallenges = this.allChallenges.filter((challenge) => challenge.solved).length
  }
}
