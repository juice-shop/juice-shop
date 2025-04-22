import { type ComponentFixture, TestBed } from '@angular/core/testing'

import { ChallengesUnavailableWarningComponent } from './challenges-unavailable-warning.component'
import { TranslateModule } from '@ngx-translate/core'
import { DEFAULT_FILTER_SETTING } from '../../filter-settings/FilterSetting'

describe('ChallengesUnavailableWarningComponent', () => {
  let component: ChallengesUnavailableWarningComponent
  let fixture: ComponentFixture<ChallengesUnavailableWarningComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), ChallengesUnavailableWarningComponent]
    })
      .compileComponents()

    fixture = TestBed.createComponent(ChallengesUnavailableWarningComponent)
    component = fixture.componentInstance

    component.challenges = [
      {
        category: 'foobar',
        name: 'my name',
        mitigationUrl: 'https://owasp.example.com',
        hasCodingChallenge: true,
        description: 'lorem ipsum',
        tagList: ['Easy'],
        disabledEnv: 'Docker'
      },
      {
        category: 'foobar',
        name: 'my name two',
        mitigationUrl: 'https://owasp.example.com',
        hasCodingChallenge: true,
        description: 'lorem ipsum',
        tagList: ['Easy'],
        disabledEnv: null
      }
    ] as any

    component.filterSetting = structuredClone(DEFAULT_FILTER_SETTING)

    fixture.detectChanges()
  })

  it('should properly calculate number of disabled challenges when there is one out of two', () => {
    component.ngOnChanges()

    expect(component.numberOfDisabledChallenges).toBe(1)
    expect(component.disabledBecauseOfEnv).toBe('Docker')
  })

  it('should properly calculate number of disabled challenges when there are none', () => {
    component.challenges = [
      {
        category: 'foobar',
        name: 'my name',
        mitigationUrl: 'https://owasp.example.com',
        hasCodingChallenge: true,
        description: 'lorem ipsum',
        tagList: ['Easy'],
        disabledEnv: null
      }
    ] as any

    component.ngOnChanges()

    expect(component.numberOfDisabledChallenges).toBe(0)
    expect(component.disabledBecauseOfEnv).toBeNull()
  })

  it('should properly calculate number of disabled challenges when there are multiple of different type', () => {
    component.challenges = [
      {
        category: 'foobar',
        name: 'my name',
        mitigationUrl: 'https://owasp.example.com',
        hasCodingChallenge: true,
        description: 'lorem ipsum',
        tagList: ['Easy'],
        disabledEnv: 'Docker'
      },
      {
        category: 'foobar',
        name: 'my name two',
        mitigationUrl: 'https://owasp.example.com',
        hasCodingChallenge: true,
        description: 'lorem ipsum',
        tagList: ['Easy'],
        disabledEnv: 'Windows'
      }
    ] as any

    component.ngOnChanges()

    expect(component.numberOfDisabledChallenges).toBe(2)
    expect(component.disabledBecauseOfEnv).toBe('Docker')
    expect(component.disabledOnWindows).toBeTrue()
    expect(component.numberOfDisabledChallengesOnWindows).toBe(1)
  })

  it('should toggle via filter if disabled challenges are shown', () => {
    expect(component.filterSetting.showDisabledChallenges).toBeTrue()

    component.toggleShowDisabledChallenges()

    expect(component.filterSetting.showDisabledChallenges).toBeFalse()
  })
})
