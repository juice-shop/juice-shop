import { Component, Input, type OnChanges, type OnInit, type SimpleChanges } from '@angular/core'

import { type EnrichedChallenge } from '../../types/EnrichedChallenge'
import { TranslateModule } from '@ngx-translate/core'
import { ScoreCardComponent } from '../score-card/score-card.component'
import { groupBy, sum } from 'lodash-es'
import { type ChallengeCategorySummary, ChallengeCategorySummaryComponent } from '../challenge-category-list/challenge-category-list.component'

@Component({
  selector: 'coding-challenge-progress-score-card',
  templateUrl: './coding-challenge-progress-score-card.component.html',
  styleUrls: ['./coding-challenge-progress-score-card.component.scss'],
  imports: [ScoreCardComponent, ChallengeCategorySummaryComponent, TranslateModule]
})
export class CodingChallengeProgressScoreCardComponent implements OnInit, OnChanges {
  @Input()
  public allChallenges: EnrichedChallenge[] = []

  public availableCodingChallenges: number
  public solvedCodingChallenges: number
  public challengeCategories: ChallengeCategorySummary[] = []

  ngOnInit (): void {
    this.updatedNumberOfSolvedChallenges()
    this.challengeCategories = this.calculateChallengeCategorySummary(this.allChallenges)
  }

  ngOnChanges (changes: SimpleChanges): void {
    this.updatedNumberOfSolvedChallenges()
    this.challengeCategories = this.calculateChallengeCategorySummary(this.allChallenges)
  }

  private updatedNumberOfSolvedChallenges (): void {
    const availableCodingChallenges = this.allChallenges
      .filter((challenge) => challenge.hasCodingChallenge)

    this.solvedCodingChallenges = sum(availableCodingChallenges
      .map((challenge) => challenge.codingChallengeStatus || 0))
    // multiply by 2 because each coding challenge has 2 parts (find it and fix it)
    this.availableCodingChallenges = availableCodingChallenges.length * 2
  }

  private calculateChallengeCategorySummary (challenges: readonly EnrichedChallenge[]): ChallengeCategorySummary[] {
    const groupedChallenges = groupBy(challenges, 'category')
    return Object.entries(groupedChallenges).map(([category, challenges]) => {
      return {
        name: category,
        solved: sum(challenges.map(challenge => challenge.codingChallengeStatus || 0)),
        total: challenges.filter(challenge => challenge.hasCodingChallenge).length * 2 // multiply by 2 because each coding challenge has 2 parts (find it and fix it)
      }
    })
  }
}
