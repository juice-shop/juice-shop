import { Component, Input } from '@angular/core'

import { EnrichedChallenge } from '../../types/EnrichedChallenge'

import { hasInstructions, startHackingInstructorFor } from '../../../../hacking-instructor'

@Component({
  selector: 'challenge-card',
  templateUrl: './challenge-card.component.html',
  styleUrls: ['./challenge-card.component.scss']
})
export class ChallengeCardComponent {
  @Input()
  public challenge: EnrichedChallenge

  @Input()
  public openCodingChallengeDialog: (challengeKey: string) => void

  public hasInstructions = hasInstructions
  public startHackingInstructorFor = startHackingInstructorFor

  codingChallengeStatusColor () {
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
