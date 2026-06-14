import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core'
import { type EnrichedChallenge } from '../../types/EnrichedChallenge'
import { TranslateModule } from '@ngx-translate/core'
import { ScoreCardComponent } from '../score-card/score-card.component'

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'hacking-challenge-progress-score-card',
  templateUrl: './hacking-challenge-progress-score-card.component.html',
  styleUrls: ['./hacking-challenge-progress-score-card.component.scss'],
  imports: [ScoreCardComponent, TranslateModule]
})
export class HackingChallengeProgressScoreCardComponent {
  readonly allChallenges = input<EnrichedChallenge[]>([])

  readonly solvedChallenges = computed(() =>
    this.allChallenges().filter(challenge => challenge.solved).length
  )
}
