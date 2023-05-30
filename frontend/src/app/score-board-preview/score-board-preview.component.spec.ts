import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ScoreBoardPreviewComponent } from './score-board-preview.component'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { ChallengeService } from '../Services/challenge.service'
import { CodeSnippetService } from '../Services/code-snippet.service'
import { of } from 'rxjs'

describe('ScoreBoardPreviewComponent', () => {
  let component: ScoreBoardPreviewComponent
  let fixture: ComponentFixture<ScoreBoardPreviewComponent>
  let challengeService
  let codeSnippetService

  beforeEach(async () => {
    challengeService = jasmine.createSpyObj('ChallengeService', ['find'])
    codeSnippetService = jasmine.createSpyObj('CodeSnippetService', ['challenges'])
    await TestBed.configureTestingModule({
      declarations: [ScoreBoardPreviewComponent],
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        { provide: ChallengeService, useValue: challengeService },
        { provide: CodeSnippetService, useValue: codeSnippetService }
      ]
    })
    .compileComponents()

    challengeService.find.and.returnValue(of([]))
    codeSnippetService.challenges.and.returnValue(of([]))

    fixture = TestBed.createComponent(ScoreBoardPreviewComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
