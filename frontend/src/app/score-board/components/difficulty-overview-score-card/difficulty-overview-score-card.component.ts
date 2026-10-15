import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core'

import { type EnrichedChallenge } from '../../types/EnrichedChallenge'
import { TranslateModule } from '@ngx-translate/core'

import { ScoreCardComponent } from '../score-card/score-card.component'

interface DifficultySummary {
  difficulty: 0 | 1 | 2 | 3 | 4 | 5 | 6
  availableChallenges: number
  solvedChallenges: number
}

type DifficultySummaries = Record<number, DifficultySummary>

const INITIAL_SUMMARIES: Readonly<DifficultySummaries> = Object.freeze({
  1: { difficulty: 1, availableChallenges: 0, solvedChallenges: 0 },
  2: { difficulty: 2, availableChallenges: 0, solvedChallenges: 0 },
  3: { difficulty: 3, availableChallenges: 0, solvedChallenges: 0 },
  4: { difficulty: 4, availableChallenges: 0, solvedChallenges: 0 },
  5: { difficulty: 5, availableChallenges: 0, solvedChallenges: 0 },
  6: { difficulty: 6, availableChallenges: 0, solvedChallenges: 0 }
})

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'difficulty-overview-score-card',
  templateUrl: './difficulty-overview-score-card.component.html',
  styleUrls: ['./difficulty-overview-score-card.component.scss'],
  imports: [ScoreCardComponent, TranslateModule]
})
export class DifficultyOverviewScoreCardComponent {
  readonly allChallenges = input<EnrichedChallenge[]>([])

  private readonly codingChallenges = computed(() =>
    this.allChallenges().filter(challenge => challenge.hasCodingChallenge)
  )

  // includes hacking and coding challenges (both find it and fix it)
  readonly totalChallenges = computed(() =>
    this.allChallenges().length + this.codingChallenges().length * 2
  )

  readonly solvedChallenges = computed(() => {
    const solvedHacking = this.allChallenges().filter(challenge => challenge.solved).length
    const codingScore = this.codingChallenges()
      .map(challenge => challenge.codingChallengeStatus)
      .reduce((a, b) => a + b, 0)
    return solvedHacking + codingScore
  })

  readonly difficultySummaries = computed(() =>
    DifficultyOverviewScoreCardComponent.calculateDifficultySummaries(this.allChallenges())
  )

  static calculateDifficultySummaries (challenges: EnrichedChallenge[]): DifficultySummary[] {
    const summariesLookup: DifficultySummaries = structuredClone(INITIAL_SUMMARIES)
    for (const challenge of challenges) {
      summariesLookup[challenge.difficulty].availableChallenges += challenge.hasCodingChallenge ? 3 : 1
      if (challenge.solved) {
        summariesLookup[challenge.difficulty].solvedChallenges++
        summariesLookup[challenge.difficulty].solvedChallenges += challenge.hasCodingChallenge ? challenge.codingChallengeStatus : 0
      }
    }
    return Object.values(summariesLookup)
      .sort((a, b) => a.difficulty - b.difficulty)
  }
}
