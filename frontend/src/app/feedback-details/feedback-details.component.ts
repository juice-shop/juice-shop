/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, type OnInit, Inject } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog'
import { TranslateModule } from '@ngx-translate/core'
import { MatButtonModule } from '@angular/material/button'

import { MatDivider } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'

@Component({
  selector: 'app-feedback-details',
  templateUrl: './feedback-details.component.html',
  styleUrls: ['./feedback-details.component.scss'],
  imports: [MatDialogContent, MatDivider, MatDialogActions, MatButtonModule, MatDialogClose, TranslateModule, MatIconModule]
})
export class FeedbackDetailsComponent implements OnInit {
  public feedback: any
  public id: any
  constructor (@Inject(MAT_DIALOG_DATA) public dialogData: any) { }

  ngOnInit (): void {
    this.feedback = this.dialogData.feedback
    this.id = this.dialogData.id
  }
}
