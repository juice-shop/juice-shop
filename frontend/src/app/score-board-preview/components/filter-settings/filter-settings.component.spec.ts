import { ComponentFixture, TestBed } from '@angular/core/testing'

import { FilterSettingsComponent } from './filter-settings.component'
import { CategoryFilterComponent } from './components/category-filter/category-filter.component'

describe('FilterSettingsComponent', () => {
  let component: FilterSettingsComponent
  let fixture: ComponentFixture<FilterSettingsComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilterSettingsComponent, CategoryFilterComponent]
    })
    .compileComponents()

    fixture = TestBed.createComponent(FilterSettingsComponent)
    component = fixture.componentInstance

    component.allChallenges = []
    component.filterSetting = {
      categories: new Set()
    }

    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
