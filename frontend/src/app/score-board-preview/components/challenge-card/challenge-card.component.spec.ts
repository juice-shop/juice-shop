import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ChallengeCardComponent } from './challenge-card.component'
import { Config } from 'src/app/Services/configuration.service'
import { TranslateModule } from '@ngx-translate/core'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltipModule } from '@angular/material/tooltip'

describe('ChallengeCard', () => {
  let component: ChallengeCardComponent
  let fixture: ComponentFixture<ChallengeCardComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), MatIconModule, MatTooltipModule],
      declarations: [ChallengeCardComponent]
    })
    .compileComponents()

    fixture = TestBed.createComponent(ChallengeCardComponent)
    component = fixture.componentInstance

    component.challenge = {
        category: 'foobar',
        name: 'my name',
        mitigationUrl: 'https://owasp.example.com',
        hasCodingChallenge: true,
        description: 'lorem ipsum',
        tagList: ['Easy']
    } as any

    component.applicationConfiguration = {
      ctf: {
        showFlagsInNotifications: true
      }
    } as Config

    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
