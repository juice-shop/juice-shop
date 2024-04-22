import { Component, Input } from '@angular/core'

import { EnrichedChallenge } from '../../types/EnrichedChallenge'

import { hasInstructions, startHackingInstructorFor } from '../../../../hacking-instructor'
import { Config } from 'src/app/Services/configuration.service'
import { ChallengeHintPipe } from '../../pipes/challenge-hint.pipe'
import { TranslateModule } from '@ngx-translate/core'
import { MatIcon } from '@angular/material/icon'
import { MatTooltip } from '@angular/material/tooltip'
import { NgFor, NgIf, NgClass, AsyncPipe } from '@angular/common'
import { DifficultyStarsComponent } from '../difficulty-stars/difficulty-stars.component'

@Component({
  selector: 'challenge-card',
  templateUrl: './challenge-card.component.html',
  styleUrls: ['./challenge-card.component.scss'],
  standalone: true,
  imports: [DifficultyStarsComponent, NgFor, MatTooltip, NgIf, MatIcon, NgClass, AsyncPipe, TranslateModule, ChallengeHintPipe]
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
