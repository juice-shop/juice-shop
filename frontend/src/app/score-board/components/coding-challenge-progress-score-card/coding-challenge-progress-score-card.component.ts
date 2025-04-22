import { Component, Input, type OnChanges, type OnInit, type SimpleChanges } from '@angular/core'

import { type EnrichedChallenge } from '../../types/EnrichedChallenge'
import { TranslateModule } from '@ngx-translate/core'
import { ScoreCardComponent } from '../score-card/score-card.component'

@Component({
  selector: 'coding-challenge-progress-score-card',
  templateUrl: './coding-challenge-progress-score-card.component.html',
  styleUrls: ['./coding-challenge-progress-score-card.component.scss'],
  imports: [ScoreCardComponent, TranslateModule]
})
export class CodingChallengeProgressScoreCardComponent implements OnInit, OnChanges {
  @Input()
  public allChallenges: EnrichedChallenge[] = []

  public availableCodingChallenges: number
  public solvedCodingChallenges: number

  ngOnInit (): void {
    this.updatedNumberOfSolvedChallenges()
  }

  ngOnChanges (changes: SimpleChanges): void {
    this.updatedNumberOfSolvedChallenges()
  }

  private updatedNumberOfSolvedChallenges (): void {
    const availableCodingChallenges = this.allChallenges
      .filter((challenge) => challenge.hasCodingChallenge)

    this.solvedCodingChallenges = availableCodingChallenges
      .map((challenge) => challenge.codingChallengeStatus)
      .reduce((a, b) => a + b, 0) // sum up the scores
    // multiply by 2 because each coding challenge has 2 parts (find it and fix it)
    this.availableCodingChallenges = availableCodingChallenges.length * 2
  }
}
