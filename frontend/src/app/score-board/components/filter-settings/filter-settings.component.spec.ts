import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { FilterSettingsComponent } from './filter-settings.component'
import { CategoryFilterComponent } from './components/category-filter/category-filter.component'
import { DEFAULT_FILTER_SETTING } from '../../filter-settings/FilterSetting'
import { TranslateModule } from '@ngx-translate/core'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatDialogModule, MatDialog } from '@angular/material/dialog'
import { DifficultySelectionSummaryPipe } from './pipes/difficulty-selection-summary.pipe'
import { LocalBackupService } from 'src/app/Services/local-backup.service'

describe('FilterSettingsComponent', () => {
  let component: FilterSettingsComponent
  let fixture: ComponentFixture<FilterSettingsComponent>
  let dialog: MatDialog

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        TranslateModule.forRoot(),
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatTooltipModule,
        MatDialogModule,
        FilterSettingsComponent,
        CategoryFilterComponent,
        DifficultySelectionSummaryPipe
      ],
      providers: [
        {
          provide: LocalBackupService,
          useValue: {
            save: () => null,
            restore: () => null
          }
        }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(FilterSettingsComponent)
    component = fixture.componentInstance
    dialog = TestBed.inject(MatDialog)

    component.allChallenges = []
    component.filterSetting = { ...DEFAULT_FILTER_SETTING }

    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should not be possible to reset filter when default filters are set', () => {
    component.filterSetting = { ...DEFAULT_FILTER_SETTING }
    expect(component.canBeReset()).toBeFalse()
  })

  it('should be possible to reset difficulty filter', () => {
    component.filterSetting = { ...DEFAULT_FILTER_SETTING, difficulties: [1] }
    expect(component.canBeReset()).toBeTrue()
  })

  it('should be possible to reset status filter', () => {
    component.filterSetting = { ...DEFAULT_FILTER_SETTING, status: 'unsolved' }
    expect(component.canBeReset()).toBeTrue()
  })

  it('should be possible to reset tag filter', () => {
    component.filterSetting = { ...DEFAULT_FILTER_SETTING, tags: ['tag1'] }
    expect(component.canBeReset()).toBeTrue()
  })

  it('should be possible to reset category filter', () => {
    component.filterSetting = { ...DEFAULT_FILTER_SETTING, categories: ['category1'] }
    expect(component.canBeReset()).toBeTrue()
  })

  it('should be possible to reset search filter', () => {
    component.filterSetting = { ...DEFAULT_FILTER_SETTING, searchQuery: 'sqli' }
    expect(component.canBeReset()).toBeTrue()
  })

  it('should be possible to reset filter for disabled challenges', () => {
    component.filterSetting = { ...DEFAULT_FILTER_SETTING, showDisabledChallenges: false }
    expect(component.canBeReset()).toBeTrue()
  })

  it('should open additional settings dialog', () => {
    spyOn(dialog, 'open')
    component.openAdditionalSettingsDialog()
    expect(dialog.open).toHaveBeenCalled()
  })

  it('should emit difficulty filter change', () => {
    spyOn(component.filterSettingChange, 'emit')
    const difficulties = [1, 2, 3]
    component.onDifficultyFilterChange([1, 2, 3])
    expect(component.filterSettingChange.emit).toHaveBeenCalledWith(jasmine.objectContaining({ difficulties }))
  })

  it('should emit status filter change', () => {
    spyOn(component.filterSettingChange, 'emit')
    const status = 'unsolved'
    component.onStatusFilterChange(status)
    expect(component.filterSettingChange.emit).toHaveBeenCalledWith(jasmine.objectContaining({ status }))
  })

  it('should emit tag filter change', () => {
    spyOn(component.filterSettingChange, 'emit')
    const tags = ['tag1', 'tag2']
    component.onTagFilterChange(tags)
    expect(component.filterSettingChange.emit).toHaveBeenCalledWith(jasmine.objectContaining({ tags }))
  })

  it('should emit category filter change', () => {
    spyOn(component.filterSettingChange, 'emit')
    const categories = ['category1', 'category2']
    component.onCategoryFilterChange(categories)
    expect(component.filterSettingChange.emit).toHaveBeenCalledWith(jasmine.objectContaining({ categories }))
  })

  it('should emit search query filter change', () => {
    spyOn(component.filterSettingChange, 'emit')
    const searchQuery = 'query'
    component.onSearchQueryFilterChange(searchQuery)
    expect(component.filterSettingChange.emit).toHaveBeenCalledWith(jasmine.objectContaining({ searchQuery }))
  })
})
