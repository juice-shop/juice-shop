import { Component, EventEmitter, Output } from '@angular/core'
import { LocalBackupService } from 'src/app/Services/local-backup.service'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { TranslateModule } from '@ngx-translate/core'
import { MatDialogContent, MatDialogTitle, MatDialogActions, MatDialogClose, MatDialog } from '@angular/material/dialog'
import { ResetProgressConfirmationDialogComponent } from '../../../reset-progress-button/reset-progress-confirmation-dialog.component'

@Component({
  selector: 'score-board-additional-settings-dialog',
  templateUrl: './score-board-additional-settings-dialog.component.html',
  styleUrls: ['./score-board-additional-settings-dialog.component.scss'],
  imports: [MatDialogContent, MatDialogTitle, TranslateModule, MatButtonModule, MatIconModule, MatDialogActions, MatDialogClose]
})
export class ScoreBoardAdditionalSettingsDialogComponent {
  @Output()
  public resetProgress = new EventEmitter<void>()

  constructor (
    public localBackupService: LocalBackupService,
    private dialog: MatDialog
  ) {}

  onResetProgress () {
    const dialogRef = this.dialog.open(ResetProgressConfirmationDialogComponent, {
      width: '360px',
      maxWidth: '90vw',
      disableClose: true
    })

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.resetProgress.emit()
      }
    })
  }
}
