import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core'
import { FilterSetting } from '../../types/FilterSetting'
import { EnrichedChallenge } from '../../types/EnrichedChallenge'

@Component({
  selector: 'filter-settings',
  templateUrl: './filter-settings.component.html',
  styleUrls: [ './filter-settings.component.scss' ]
})
export class FilterSettingsComponent implements OnChanges {
  @Input()
  public allChallenges: EnrichedChallenge[]

  @Input()
  public filterSetting: FilterSetting

  @Input()
  public reset: () => void

  @Output()
  public filterSettingChange = new EventEmitter<FilterSetting>()

  public tags: Set<string> = new Set()
  ngOnChanges () {
    this.tags = new Set(this.allChallenges.flatMap((challenge) => challenge.tagList))
  }

  onDifficultyFilterChange (difficulties: Array<1|2|3|4|5|6>) {
    const filterSettingCopy = structuredClone(this.filterSetting)
    filterSettingCopy.difficulties = difficulties
    this.filterSettingChange.emit(filterSettingCopy)
  }

  onStatusFilterChange (status: 'solved' | 'unsolved' | null) {
    const filterSettingCopy = structuredClone(this.filterSetting)
    filterSettingCopy.status = status
    this.filterSettingChange.emit(filterSettingCopy)
  }

  onTagFilterChange (tags: string[]) {
    const filterSettingCopy = structuredClone(this.filterSetting)
    filterSettingCopy.tags = tags
    this.filterSettingChange.emit(filterSettingCopy)
  }

  onCategoryFilterChange (categories: Set<string>) {
    const filterSettingCopy = structuredClone(this.filterSetting)
    filterSettingCopy.categories = categories
    this.filterSettingChange.emit(filterSettingCopy)
  }

  onSearchQueryFilterChange (searchQuery: string) {
    const filterSettingCopy = structuredClone(this.filterSetting)
    filterSettingCopy.searchQuery = searchQuery
    this.filterSettingChange.emit(filterSettingCopy)
  }
}
