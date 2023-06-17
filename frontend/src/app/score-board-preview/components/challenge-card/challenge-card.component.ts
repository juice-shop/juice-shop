import { Component, Input } from '@angular/core'

import { EnrichedChallenge } from '../../types/EnrichedChallenge'

@Component({
  selector: 'challenge-card',
  templateUrl: './challenge-card.component.html',
  styleUrls: ['./challenge-card.component.scss']
})
export class ChallengeCardComponent {
  @Input()
  public challenge: EnrichedChallenge

  codingChallengeStatusColor() {
    if (!this.challenge.hasCodingChallenge || !this.challenge.solved) {
      return 'var(--theme-background-lighter)'
    }
    switch (this.challenge.codingChallengeStatus) {
      case 0:
        return 'var(--theme-background-lighter)'
      case 1:
        return 'var(--theme-accent-dark)'
      case 2:
        return 'var(--theme-accent)'
    }
  }
}
