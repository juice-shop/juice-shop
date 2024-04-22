import { type ComponentFixture, TestBed } from '@angular/core/testing'

import { ScoreBoardAdditionalSettingsDialogComponent } from './score-board-additional-settings-dialog.component'
import { TranslateModule } from '@ngx-translate/core'
import { MatDialogModule } from '@angular/material/dialog'
import { LocalBackupService } from 'src/app/Services/local-backup.service'

describe('ScoreBoardAdditionalSettingsDialogComponent', () => {
  let component: ScoreBoardAdditionalSettingsDialogComponent
  let fixture: ComponentFixture<ScoreBoardAdditionalSettingsDialogComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), MatDialogModule, ScoreBoardAdditionalSettingsDialogComponent],
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
