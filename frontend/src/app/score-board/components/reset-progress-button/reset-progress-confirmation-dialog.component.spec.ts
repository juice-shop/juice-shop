import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { ResetProgressConfirmationDialogComponent } from './reset-progress-confirmation-dialog.component'
import { TranslateModule } from '@ngx-translate/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatDialogContent, MatDialogTitle, MatDialogActions, MatDialogClose } from '@angular/material/dialog'

describe('ResetProgressConfirmationDialogComponent', () => {
  let component: ResetProgressConfirmationDialogComponent
  let fixture: ComponentFixture<ResetProgressConfirmationDialogComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ResetProgressConfirmationDialogComponent,
        TranslateModule.forRoot(),
        MatButtonModule,
        MatIconModule,
        MatDialogContent,
        MatDialogTitle,
        MatDialogActions,
        MatDialogClose
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(ResetProgressConfirmationDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
