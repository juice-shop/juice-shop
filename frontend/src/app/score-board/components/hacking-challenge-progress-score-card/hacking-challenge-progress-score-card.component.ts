import { Component, Input, type OnChanges, type OnInit, type SimpleChanges } from '@angular/core'
import { type EnrichedChallenge } from '../../types/EnrichedChallenge'

@Component({
  selector: 'hacking-challenge-progress-score-card',
  templateUrl: './hacking-challenge-progress-score-card.component.html',
  styleUrls: ['./hacking-challenge-progress-score-card.component.scss']
})
export class HackingChallengeProgressScoreCardComponent implements OnInit, OnChanges {
  @Input()
  public allChallenges: EnrichedChallenge[] = []

  public solvedChallenges: number

  ngOnInit (): void {
    this.updatedNumberOfSolvedChallenges()
  }

  ngOnChanges (changes: SimpleChanges): void {
    this.updatedNumberOfSolvedChallenges()
  }

  private updatedNumberOfSolvedChallenges (): void {
    this.solvedChallenges = this.allChallenges.filter((challenge) => challenge.solved).length
  }
}
