import { Component } from '@angular/core'
import { LocalBackupService } from 'src/app/Services/local-backup.service'
import { MatIcon } from '@angular/material/icon'
import { MatButton } from '@angular/material/button'
import { TranslateModule } from '@ngx-translate/core'
import { MatDialogContent, MatDialogTitle, MatDialogActions, MatDialogClose } from '@angular/material/dialog'

@Component({
  selector: 'score-board-additional-settings-dialog',
  templateUrl: './score-board-additional-settings-dialog.component.html',
  styleUrls: ['./score-board-additional-settings-dialog.component.scss'],
  standalone: true,
  imports: [MatDialogContent, MatDialogTitle, TranslateModule, MatButton, MatIcon, MatDialogActions, MatDialogClose]
})
export class ScoreBoardAdditionalSettingsDialogComponent {
  constructor (
    public localBackupService: LocalBackupService
  ) {}
}
