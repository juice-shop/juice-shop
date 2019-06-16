import { Injectable } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { TranslateService } from '@ngx-translate/core'

@Injectable({
  providedIn: 'root'
})
export class SnackBarHelperService {

  constructor (private translateService: TranslateService,
               private snackBar: MatSnackBar) { }

  openSnackBar (message: string, action: string) {
    this.translateService.get(message).subscribe((translatedMessage) => {
      this.snackBar.open(translatedMessage, action, {
        duration: 5000
      })
    }, () => {
      this.snackBar.open(message, action, {
        duration: 5000
      })
    })
  }
}
