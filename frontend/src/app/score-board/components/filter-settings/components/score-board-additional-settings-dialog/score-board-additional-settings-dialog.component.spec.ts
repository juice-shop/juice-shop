import { type ComponentFixture, TestBed } from '@angular/core/testing'

import { ScoreBoardAdditionalSettingsDialogComponent } from './score-board-additional-settings-dialog.component'
import { TranslateModule } from '@ngx-translate/core'
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { FeatureFlagService } from 'src/app/Services/feature-flag.service'
import { of } from 'rxjs'
import { LocalBackupService } from 'src/app/Services/local-backup.service'

describe('ScoreBoardAdditionalSettingsDialogComponent', () => {
  let component: ScoreBoardAdditionalSettingsDialogComponent
  let fixture: ComponentFixture<ScoreBoardAdditionalSettingsDialogComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), MatDialogModule],
      declarations: [ScoreBoardAdditionalSettingsDialogComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {}
        },
        {
          provide: FeatureFlagService,
          useValue: {
            defaultScoreBoard$: of('v1'),
            setDefaultScoreBoard: () => null
          }
        },
        {
          provide: LocalBackupService,
          useValue: {
            save: () => null,
            restore: () => null
          }
        }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(
      ScoreBoardAdditionalSettingsDialogComponent
    )
    component = fixture.componentInstance

    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
