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
import { MatDialogModule } from '@angular/material/dialog'
import { DifficultySelectionSummaryPipe } from './pipes/difficulty-selection-summary.pipe'
import { LocalBackupService } from 'src/app/Services/local-backup.service'

describe('FilterSettingsComponent', () => {
  let component: FilterSettingsComponent
  let fixture: ComponentFixture<FilterSettingsComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        TranslateModule.forRoot(),
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatTooltipModule,
        MatDialogModule
      ],
      declarations: [
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

    component.allChallenges = []
    component.filterSetting = { ...DEFAULT_FILTER_SETTING }

    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
