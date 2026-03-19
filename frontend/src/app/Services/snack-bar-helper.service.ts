import { Injectable, inject } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { TranslateService } from '@ngx-translate/core'

@Injectable({
  providedIn: 'root'
})
export class SnackBarHelperService {
  private readonly translateService = inject(TranslateService)
  private readonly snackBar = inject(MatSnackBar)

  private isSnackbarOpen = false

  open(message: string, cssClass?: string) {
    if (this.isSnackbarOpen) return

    this.translateService.get(message).subscribe({
      next: (translatedMessage) => {
        this.showSnack(translatedMessage, cssClass)
      },
      error: () => {
        this.showSnack(message, cssClass)
      }
    })
  }

  private showSnack(message: string, cssClass?: string) {
    this.isSnackbarOpen = true

    const snackRef = this.snackBar.open(message, 'X', {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'right',
      panelClass: [cssClass || '', 'mat-body', 'custom-snackbar']
    })

    snackRef.afterDismissed().subscribe(() => {
      this.isSnackbarOpen = false
    })
  }
}