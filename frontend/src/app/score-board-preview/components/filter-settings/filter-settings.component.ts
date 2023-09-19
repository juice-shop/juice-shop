import { Component, EventEmitter, Input, type OnChanges, OnInit, Output } from '@angular/core'
import { DEFAULT_FILTER_SETTING, FilterSetting } from '../../filter-settings/FilterSetting'
import { type EnrichedChallenge } from '../../types/EnrichedChallenge'
import { MatDialog } from '@angular/material/dialog'
import { ScoreBoardAdditionalSettingsDialogComponent } from './components/score-board-additional-settings-dialog/score-board-additional-settings-dialog.component'

@Component({
  selector: 'filter-settings',
  templateUrl: './filter-settings.component.html',
  styleUrls: ['./filter-settings.component.scss']
})
export class FilterSettingsComponent implements OnChanges {
  @Input()
  public allChallenges: EnrichedChallenge[]

  @Input()
  public filterSetting: FilterSetting

  @Output()
  public filterSettingChange = new EventEmitter<FilterSetting>()

  @Input()
  public reset: () => void

  constructor (private readonly dialog: MatDialog) { }

  public tags = new Set<string>()
  ngOnChanges () {
    this.tags = new Set(this.allChallenges.flatMap((challenge) => challenge.tagList))
  }

  onDifficultyFilterChange (difficulties: Array<1 | 2 | 3 | 4 | 5 | 6>) {
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

  onCategoryFilterChange (categories: string[]) {
    const filterSettingCopy = structuredClone(this.filterSetting)
    filterSettingCopy.categories = categories
    this.filterSettingChange.emit(filterSettingCopy)
  }

  onSearchQueryFilterChange (searchQuery: string) {
    const filterSettingCopy = structuredClone(this.filterSetting)
    filterSettingCopy.searchQuery = searchQuery
    this.filterSettingChange.emit(filterSettingCopy)
  }

  public canBeReset (): boolean {
    return this.filterSetting.difficulties.length > 0 ||
      this.filterSetting.status !== null ||
      this.filterSetting.tags.length > 0 ||
      this.filterSetting.categories.length > 0 ||
      !!this.filterSetting.searchQuery ||
      !this.filterSetting.showDisabledChallenges
  }

  public openAdditionalSettingsDialog () {
    this.dialog.open(ScoreBoardAdditionalSettingsDialogComponent)
  }
}
