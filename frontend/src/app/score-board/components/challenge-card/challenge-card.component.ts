import { Component, Input, type OnInit, inject, type OnChanges, type SimpleChanges, ViewChild } from '@angular/core'
import { EnrichedChallenge } from '../../types/EnrichedChallenge'
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
export class ChallengeCardComponent implements OnInit, OnChanges {
  private readonly snackBarHelperService = inject(SnackBarHelperService)

  @Input()
  public challenge: EnrichedChallenge

  @Input()
  public openCodingChallengeDialog: (challengeKey: string) => void

  @Input()
  public repeatChallengeNotification: (challengeKey: string) => void

  @Input()
  public unlockHint: (hintId: number, challengeKey?: string) => void

  @Input()
  public applicationConfiguration: Config

  @Input()
  public lastUnlockedChallengeKey: string | null = null

  @ViewChild('hintTooltip')
  public hintTooltip?: MatTooltip

  private previousHintsUnlocked?: number

  public hasInstructions: (challengeName: string) => boolean = () => false
  public startHackingInstructorFor: (challengeName: string) => Promise<void> = async () => {}

  async ngOnInit () {
    const { hasInstructions, startHackingInstructorFor } = await import('../../../../hacking-instructor')
    this.hasInstructions = hasInstructions
    this.startHackingInstructorFor = startHackingInstructorFor
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes['challenge']?.currentValue) {
      const currentHintsUnlocked = this.challenge?.hintsUnlocked
      if (
        this.lastUnlockedChallengeKey === this.challenge?.key &&
        this.previousHintsUnlocked !== undefined &&
        currentHintsUnlocked !== this.previousHintsUnlocked
      ) {
        queueMicrotask(() => this.hintTooltip?.show())
      }
      this.previousHintsUnlocked = currentHintsUnlocked
    }
  }
}
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
