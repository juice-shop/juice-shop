import { HttpClientTestingModule } from '@angular/common/http/testing'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { MatDialogModule } from '@angular/material/dialog'
import { of } from 'rxjs'

import { ScoreBoardPreviewComponent } from './score-board-preview.component'
import { CodeSnippetService } from '../Services/code-snippet.service'
import { ChallengeService } from '../Services/challenge.service'

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
        RouterTestingModule,
        MatDialogModule
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
