import { Component, EventEmitter, Input, Output } from '@angular/core'
import { FilterSetting } from '../../types/FilterSetting'
import { EnrichedChallenge } from '../../types/EnrichedChallenge'

@Component({
  selector: 'filter-settings',
  templateUrl: './filter-settings.component.html'
})
export class FilterSettingsComponent {
  @Input()
  readonly allChallenges: EnrichedChallenge[]

  @Input()
  filterSetting: FilterSetting

  @Output()
  filterSettingChange = new EventEmitter<FilterSetting>()

  public onCategoryUpdate (categories: Set<string>) {
    const filterSettingCopy = structuredClone(this.filterSetting)
    filterSettingCopy.categories = categories
    this.filterSettingChange.emit(filterSettingCopy)
  }
}
