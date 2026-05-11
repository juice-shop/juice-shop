import { Component, Input, type OnChanges } from '@angular/core'

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
export class TutorialModeWarningComponent implements OnChanges {
  @Input()
  public allChallenges: EnrichedChallenge[]

  @Input()
  public applicationConfig: Config | null = null

  public tutorialModeActive: boolean | null = null

  ngOnChanges (): void {
    if (!this.applicationConfig?.challenges?.restrictToTutorialsFirst) {
      this.tutorialModeActive = false
      return
    }

    const allTutorialChallengesSolved = this.allChallenges
      .filter(challenge => challenge.tutorialOrder !== null)
      .every(challenge => challenge.solved)
    this.tutorialModeActive = !allTutorialChallengesSolved
  }
}
