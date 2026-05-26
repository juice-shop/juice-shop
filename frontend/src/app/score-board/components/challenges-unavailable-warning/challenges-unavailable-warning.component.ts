import { Component, computed, input, model } from '@angular/core'

import { FilterSetting } from '../../filter-settings/FilterSetting'
import { type EnrichedChallenge } from '../../types/EnrichedChallenge'
import { TranslateModule } from '@ngx-translate/core'
import { MatButtonModule } from '@angular/material/button'
import { WarningCardComponent } from '../warning-card/warning-card.component'
import { NgClass } from '@angular/common'

@Component({
  selector: 'challenges-unavailable-warning',
  templateUrl: './challenges-unavailable-warning.component.html',
  styleUrls: ['./challenges-unavailable-warning.component.scss'],
  imports: [WarningCardComponent, NgClass, MatButtonModule, TranslateModule]
})
export class ChallengesUnavailableWarningComponent {
  readonly challenges = input.required<EnrichedChallenge[]>()
  readonly filterSetting = model.required<FilterSetting>()

  private readonly disabledChallenges = computed(() =>
    this.challenges().filter(challenge => challenge.disabledEnv !== null)
  )

  private readonly disabledOnWindowsChallenges = computed(() =>
    this.disabledChallenges().filter(challenge => challenge.disabledEnv === 'Windows')
  )

  readonly numberOfDisabledChallenges = computed(() => this.disabledChallenges().length)
  readonly disabledBecauseOfEnv = computed(() => {
    const disabled = this.disabledChallenges()
    return disabled.length > 0 ? disabled[0].disabledEnv : null
  })

  readonly disabledOnWindows = computed(() => this.disabledOnWindowsChallenges().length > 0)
  readonly numberOfDisabledChallengesOnWindows = computed(() => this.disabledOnWindowsChallenges().length)

  toggleShowDisabledChallenges () {
    this.filterSetting.update(current => ({
      ...structuredClone(current),
      showDisabledChallenges: !current.showDisabledChallenges
    }))
  }
}
