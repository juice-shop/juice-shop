import { Component, input, viewChild, inject, effect } from '@angular/core'
import { EnrichedChallenge } from '../../types/EnrichedChallenge'
import { Config } from 'src/app/Services/configuration.service'
import { TranslateModule } from '@ngx-translate/core'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltip } from '@angular/material/tooltip'
import { RouterLink } from '@angular/router'
import { NgClass } from '@angular/common'
import { DifficultyStarsComponent } from '../difficulty-stars/difficulty-stars.component'
import { SnackBarHelperService } from 'src/app/Services/snack-bar-helper.service'

@Component({
  selector: 'challenge-card',
  templateUrl: './challenge-card.component.html',
  styleUrls: ['./challenge-card.component.scss'],
  imports: [DifficultyStarsComponent, MatTooltip, MatIconModule, NgClass, TranslateModule, RouterLink],
  host: { '[attr.id]': 'challengeId()' }
})
export class ChallengeCardComponent {
  private readonly snackBarHelperService = inject(SnackBarHelperService)

  readonly challenge = input.required<EnrichedChallenge>()
  readonly repeatChallengeNotification = input<(challengeKey: string) => void>()
  readonly unlockHint = input<(hintId: number, challengeKey?: string) => void>()
  readonly applicationConfiguration = input.required<Config>()
  readonly lastUnlockedChallengeKey = input<string | null>(null)
  readonly challengeId = input<string>()

  readonly hintTooltip = viewChild<MatTooltip>('hintTooltip')

  private previousHintsUnlocked?: number

  hasInstructions: (challengeName: string) => boolean = () => false
  startHackingInstructorFor: (challengeName: string) => Promise<void> = async () => {}

  constructor () {
    void import('../../../../hacking-instructor').then(({ hasInstructions, startHackingInstructorFor }) => {
      this.hasInstructions = hasInstructions
      this.startHackingInstructorFor = startHackingInstructorFor
    })

    effect(() => {
      const challenge = this.challenge()
      const lastUnlockedKey = this.lastUnlockedChallengeKey()
      const currentHintsUnlocked = challenge?.hintsUnlocked

      if (
        lastUnlockedKey === challenge?.key &&
        this.previousHintsUnlocked !== undefined &&
        currentHintsUnlocked !== this.previousHintsUnlocked
      ) {
        queueMicrotask(() => setTimeout(() => { this.hintTooltip()?.show() }, 50))
      }
      this.previousHintsUnlocked = currentHintsUnlocked
    })
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

  isDependencyMissing (tag: string): boolean {
    if (!this.challenge().ChallengeDependencies) {
      return false
    }
    const dependencyName = tag.substring('Requires '.length)
    return this.challenge().ChallengeDependencies.some((dep) => dep.name === dependencyName && dep.missing)
  }

  getDependencyDocumentation (tag: string): string | null {
    if (!this.challenge().ChallengeDependencies) {
      return null
    }
    const dependencyName = tag.substring('Requires '.length)
    const dependency = this.challenge().ChallengeDependencies.find((dep) => dep.name === dependencyName)
    return dependency ? dependency.documentation : null
  }

  getDependency (tag: string) {
    if (!this.challenge().ChallengeDependencies) {
      return null
    }
    const dependencyName = tag.substring('Requires '.length)
    return this.challenge().ChallengeDependencies.find((dep) => dep.name === dependencyName)
  }
}
