import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core'

import { type EnrichedChallenge } from '../../types/EnrichedChallenge'
import { TranslateModule } from '@ngx-translate/core'
import { ScoreCardComponent } from '../score-card/score-card.component'

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'coding-challenge-progress-score-card',
  templateUrl: './coding-challenge-progress-score-card.component.html',
  styleUrls: ['./coding-challenge-progress-score-card.component.scss'],
  imports: [ScoreCardComponent, TranslateModule]
})
export class CodingChallengeProgressScoreCardComponent {
  readonly allChallenges = input<EnrichedChallenge[]>([])

  private readonly codingChallenges = computed(() =>
    this.allChallenges().filter(challenge => challenge.hasCodingChallenge)
  )

  readonly solvedCodingChallenges = computed(() =>
    this.codingChallenges().map(c => c.codingChallengeStatus).reduce((a, b) => a + b, 0)
  )

  // multiply by 2 because each coding challenge has 2 parts (find it and fix it)
  readonly availableCodingChallenges = computed(() => this.codingChallenges().length * 2)
}
