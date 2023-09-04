import { Component, Input } from '@angular/core'

import { EnrichedChallenge } from '../../types/EnrichedChallenge'

import { hasInstructions, startHackingInstructorFor } from '../../../../hacking-instructor'
import { Config } from 'src/app/Services/configuration.service'

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

  @Input()
  public repeatChallengeNotification: (challengeKey: string) => void

  @Input()
  public applicationConfiguration: Config

  public hasInstructions = hasInstructions
  public startHackingInstructorFor = startHackingInstructorFor
}
