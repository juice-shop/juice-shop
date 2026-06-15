import { Component, computed, input } from '@angular/core'

import { type EnrichedChallenge } from '../../types/EnrichedChallenge'
import { type Config } from 'src/app/Services/configuration.service'
import { TranslateModule } from '@ngx-translate/core'
import { MatIconModule } from '@angular/material/icon'
import { WarningCardComponent } from '../warning-card/warning-card.component'

@Component({
  selector: 'tutorial-mode-warning',
  templateUrl: './tutorial-mode-warning.component.html',
  imports: [WarningCardComponent, MatIconModule, TranslateModule]
})
export class TutorialModeWarningComponent {
  readonly allChallenges = input.required<EnrichedChallenge[]>()
  readonly applicationConfig = input<Config | null>(null)

  readonly tutorialModeActive = computed(() => {
    if (!this.applicationConfig()?.challenges?.restrictToTutorialsFirst) {
      return false
    }
    return !this.allChallenges()
      .filter(challenge => challenge.tutorialOrder !== null)
      .every(challenge => challenge.solved)
  })
}
