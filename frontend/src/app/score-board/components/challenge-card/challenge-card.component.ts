import { Component, Input, type OnInit, inject } from '@angular/core'
import { EnrichedChallenge } from '../../types/EnrichedChallenge'
// I reverted this to the original style found in your context. 
// If this errors locally, change it back to '../../../Services/configuration.service'
import { Config } from 'src/app/Services/configuration.service' 
import { TranslateModule } from '@ngx-translate/core'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltip } from '@angular/material/tooltip'
import { NgClass } from '@angular/common'
import { DifficultyStarsComponent } from '../difficulty-stars/difficulty-stars.component'
import { SnackBarHelperService } from 'src/app/Services/snack-bar-helper.service'

@Component({
  selector: 'challenge-card',
  templateUrl: './challenge-card.component.html',
  styleUrls: ['./challenge-card.component.scss'],
  imports: [DifficultyStarsComponent, MatTooltip, MatIconModule, NgClass, TranslateModule]
})
export class ChallengeCardComponent implements OnInit {
  // This is the new service we need
  private readonly snackBarHelperService = inject(SnackBarHelperService)

  @Input()
  public challenge: EnrichedChallenge

  @Input()
  public openCodingChallengeDialog: (challengeKey: string) => void

  @Input()
  public repeatChallengeNotification: (challengeKey: string) => void

  @Input()
  public unlockHint: (hintId: number) => void

  @Input()
  public applicationConfiguration: Config

  public hasInstructions: (challengeName: string) => boolean = () => false
  public startHackingInstructorFor: (challengeName: string) => Promise<void> = async () => {}

  async ngOnInit () {
    const { hasInstructions, startHackingInstructorFor } = await import('../../../../hacking-instructor')
    this.hasInstructions = hasInstructions
    this.startHackingInstructorFor = startHackingInstructorFor
  }

  // This is the ONLY new logic added
  copyPayload (event: MouseEvent) {
    const target = event.target as HTMLElement
    const codeElement = target.closest('code')
    if (codeElement) {
      const text = codeElement.innerText
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          this.snackBarHelperService.open('COPY_SUCCESS', 'confirmBar')
        })
      }
    }
  }
}