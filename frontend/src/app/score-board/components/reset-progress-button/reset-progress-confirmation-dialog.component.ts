import { Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { TranslateModule } from '@ngx-translate/core'
import { MatDialogContent, MatDialogTitle, MatDialogActions, MatDialogClose } from '@angular/material/dialog'

@Component({
  selector: 'reset-progress-confirmation-dialog',
  templateUrl: './reset-progress-confirmation-dialog.component.html',
  styleUrls: ['./reset-progress-confirmation-dialog.component.scss'],
  imports: [MatDialogContent, MatDialogTitle, TranslateModule, MatButtonModule, MatIconModule, MatDialogActions, MatDialogClose]
})
export class ResetProgressConfirmationDialogComponent {
}
