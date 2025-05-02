import { Component, Input, type OnChanges, type OnInit, type SimpleChanges } from '@angular/core'
import { type EnrichedChallenge } from '../../types/EnrichedChallenge'
import { TranslateModule } from '@ngx-translate/core'
import { ScoreCardComponent } from '../score-card/score-card.component'
import { JsonPipe } from '@angular/common'
import { groupBy } from 'lodash-es'
import { type ChallengeCategorySummary, ChallengeCategorySummaryComponent } from '../challenge-category-list/challenge-category-list.component'

@Component({
  selector: 'hacking-challenge-progress-score-card',
  templateUrl: './hacking-challenge-progress-score-card.component.html',
  styleUrls: ['./hacking-challenge-progress-score-card.component.scss'],
  imports: [ScoreCardComponent, ChallengeCategorySummaryComponent, TranslateModule, JsonPipe]
})
export class HackingChallengeProgressScoreCardComponent implements OnInit, OnChanges {
  @Input()
  public allChallenges: EnrichedChallenge[] = []

  public solvedChallenges: number
  public challengeCategories: ChallengeCategorySummary[] = []

  ngOnInit (): void {
    this.solvedChallenges = this.allChallenges.filter((challenge) => challenge.solved).length
    this.challengeCategories = this.calculateChallengeCategorySummary(this.allChallenges)
  }

  ngOnChanges (changes: SimpleChanges): void {
    this.solvedChallenges = this.allChallenges.filter((challenge) => challenge.solved).length
    this.challengeCategories = this.calculateChallengeCategorySummary(this.allChallenges)
  }

  private calculateChallengeCategorySummary (challenges: readonly EnrichedChallenge[]): ChallengeCategorySummary[] {
    const groupedChallenges = groupBy(challenges, 'category')
    return Object.entries(groupedChallenges).map(([category, challenges]) => ({
      name: category,
      solved: challenges.filter(challenge => challenge.solved).length,
      total: challenges.length
    }))
  }
}
