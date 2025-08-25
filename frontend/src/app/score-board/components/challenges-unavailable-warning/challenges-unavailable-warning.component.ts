import { Component, EventEmitter, Input, type OnChanges, Output } from '@angular/core'

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
export class ChallengesUnavailableWarningComponent implements OnChanges {
  @Input()
  public challenges: EnrichedChallenge[]

  @Input()
  public filterSetting: FilterSetting

  @Output()
  public filterSettingChange = new EventEmitter<FilterSetting>()

  public numberOfDisabledChallenges = 0
  public disabledBecauseOfEnv: string | null = null
  public disabledOnWindows: boolean
  public numberOfDisabledChallengesOnWindows = 0

  public ngOnChanges () {
    const disabledChallenges = this.challenges.filter(challenge => challenge.disabledEnv !== null)
    const disabledOnWindows = disabledChallenges.filter(challenge => challenge.disabledEnv === 'Windows')
    this.numberOfDisabledChallenges = disabledChallenges.length
    if (this.numberOfDisabledChallenges > 0) {
      this.disabledBecauseOfEnv = disabledChallenges[0].disabledEnv
    }
    if (disabledOnWindows.length > 0) {
      this.disabledOnWindows = true
      this.numberOfDisabledChallengesOnWindows = disabledOnWindows.length
    }
  }

  public toggleShowDisabledChallenges () {
    const filterSetting = {
      ...structuredClone(this.filterSetting),
      showDisabledChallenges: !this.filterSetting.showDisabledChallenges
    }
    this.filterSetting = filterSetting
    this.filterSettingChange.emit(filterSetting)
  }
}
