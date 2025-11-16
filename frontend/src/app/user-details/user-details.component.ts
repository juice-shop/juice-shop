/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { UserService } from '../Services/user.service'
import { Component, type OnInit, inject } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faArrowCircleLeft } from '@fortawesome/free-solid-svg-icons'
import { MatButtonModule } from '@angular/material/button'
import { TranslateModule } from '@ngx-translate/core'

import { MatDivider } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'

library.add(faArrowCircleLeft)

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss'],
  imports: [MatDialogContent, MatDivider, TranslateModule, MatDialogActions, MatButtonModule, MatDialogClose, MatIconModule]
})
export class UserDetailsComponent implements OnInit {
  dialogData = inject(MAT_DIALOG_DATA);
  private readonly userService = inject(UserService);

  public user: any

  ngOnInit (): void {
    this.userService.get(this.dialogData.id).subscribe({
      next: (user) => {
        this.user = user
      },
      error: (err) => { console.log(err) }
    })
  }
}
