import { ComponentFixture, TestBed } from '@angular/core/testing'

import { FilterSettingsComponent } from './filter-settings.component'
import { CategoryFilterComponent } from './components/category-filter/category-filter.component'
import { DEFAULT_FILTER_SETTING } from '../../types/FilterSetting'
import { TranslateModule } from '@ngx-translate/core'

describe('FilterSettingsComponent', () => {
  let component: FilterSettingsComponent
  let fixture: ComponentFixture<FilterSettingsComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [FilterSettingsComponent, CategoryFilterComponent]
    })
    .compileComponents()

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
