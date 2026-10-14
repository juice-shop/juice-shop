import { Component, inject, ChangeDetectionStrategy } from '@angular/core'
import { LocalBackupService } from '../../../../../Services/local-backup.service'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { TranslateModule } from '@ngx-translate/core'
import { MatDialogContent, MatDialogTitle, MatDialogActions, MatDialogClose } from '@angular/material/dialog'

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'score-board-additional-settings-dialog',
  templateUrl: './score-board-additional-settings-dialog.component.html',
  styleUrls: ['./score-board-additional-settings-dialog.component.scss'],
  imports: [MatDialogContent, MatDialogTitle, TranslateModule, MatButtonModule, MatIconModule, MatDialogActions, MatDialogClose]
})
export class ScoreBoardAdditionalSettingsDialogComponent {
  localBackupService = inject(LocalBackupService)

}
