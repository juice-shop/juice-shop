import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ChallengeCardComponent } from './challenge-card.component'

describe('ChallengeCard', () => {
  let component: ChallengeCardComponent
  let fixture: ComponentFixture<ChallengeCardComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
        tagList: ['Eayy'],
        difficultyAsList: [undefined, undefined, undefined]
    } as any
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
