import { Component } from '@angular/core'
import { LocalBackupService } from 'src/app/Services/local-backup.service'

@Component({
  selector: 'score-board-additional-settings-dialog',
  templateUrl: './score-board-additional-settings-dialog.component.html',
  styleUrls: ['./score-board-additional-settings-dialog.component.scss']
})
export class ScoreBoardAdditionalSettingsDialogComponent {
  constructor (
    public localBackupService: LocalBackupService
  ) {}
}
