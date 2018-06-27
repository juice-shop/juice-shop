import { BarRatingModule } from 'ngx-bar-rating'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { ChallengeService } from './../Services/challenge.service'
import { ConfigurationService } from './../Services/configuration.service'
import { WindowRefService } from './../Services/window-ref.service'
import { HttpClientModule } from '@angular/common/http'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatDividerModule } from '@angular/material/divider'
import { MatButtonModule } from '@angular/material/button'
import { MatTableModule } from '@angular/material/table'
import { MatCardModule } from '@angular/material/card'
import { MatTooltipModule } from '@angular/material/tooltip'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ScoreBoardComponent } from './score-board.component'

describe('ScoreBoardComponent', () => {
  let component: ScoreBoardComponent
  let fixture: ComponentFixture<ScoreBoardComponent>

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        BarRatingModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatTableModule,
        MatButtonModule,
        MatDividerModule,
        MatProgressBarModule,
        MatExpansionModule,
        MatTooltipModule
      ],
      declarations: [ ScoreBoardComponent ],
      providers: [
        ChallengeService,
        ConfigurationService,
        WindowRefService
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ScoreBoardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  xit('should create', () => {
    expect(component).toBeTruthy()
  })
})
