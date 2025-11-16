/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { UserDetailsComponent } from '../user-details/user-details.component'
import { FeedbackDetailsComponent } from '../feedback-details/feedback-details.component'
import { MatDialog } from '@angular/material/dialog'
import { FeedbackService } from '../Services/feedback.service'
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table'
import { UserService } from '../Services/user.service'
import { Component, type OnInit, ViewChild, inject } from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faArchive, faEye, faHome, faTrashAlt, faUser } from '@fortawesome/free-solid-svg-icons'
import { MatPaginator } from '@angular/material/paginator'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltip } from '@angular/material/tooltip'
import { MatButtonModule } from '@angular/material/button'

import { TranslateModule } from '@ngx-translate/core'
import { MatCardModule } from '@angular/material/card'

library.add(faUser, faEye, faHome, faArchive, faTrashAlt)

@Component({
  selector: 'app-administration',
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.scss'],
  imports: [MatCardModule, TranslateModule, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatButtonModule, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatPaginator, MatTooltip, MatIconModule]
})
export class AdministrationComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly userService = inject(UserService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly sanitizer = inject(DomSanitizer);

  public userDataSource: any
  public userDataSourceHidden: any
  public userColumns = ['user', 'email', 'user_detail']
  public feedbackDataSource: any
  public feedbackColumns = ['user', 'comment', 'rating', 'remove']
  public error: any
  public resultsLengthUser = 0
  public resultsLengthFeedback = 0
  @ViewChild('paginatorUsers') paginatorUsers: MatPaginator
  @ViewChild('paginatorFeedb') paginatorFeedb: MatPaginator

  ngOnInit (): void {
    this.findAllUsers()
    this.findAllFeedbacks()
  }

  findAllUsers () {
    this.userService.find().subscribe({
      next: (users) => {
        this.userDataSource = users
        this.userDataSourceHidden = users
        for (const user of this.userDataSource) {
          user.email = this.sanitizer.bypassSecurityTrustHtml(`<span class="${this.doesUserHaveAnActiveSession(user) ? 'confirmation' : 'error'}">${user.email}</span>`)
        }
        this.userDataSource = new MatTableDataSource(this.userDataSource)
        this.userDataSource.paginator = this.paginatorUsers
        this.resultsLengthUser = users.length
      },
      error: (err) => {
        this.error = err
        console.log(this.error)
      }
    })
  }

  findAllFeedbacks () {
    this.feedbackService.find().subscribe({
      next: (feedbacks) => {
        this.feedbackDataSource = feedbacks
        for (const feedback of this.feedbackDataSource) {
          feedback.comment = this.sanitizer.bypassSecurityTrustHtml(feedback.comment)
        }
        this.feedbackDataSource = new MatTableDataSource(this.feedbackDataSource)
        this.feedbackDataSource.paginator = this.paginatorFeedb
        this.resultsLengthFeedback = feedbacks.length
      },
      error: (err) => {
        this.error = err
        console.log(this.error)
      }
    })
  }

  deleteFeedback (id: number) {
    this.feedbackService.del(id).subscribe({
      next: () => {
        this.findAllFeedbacks()
      },
      error: (err) => {
        this.error = err
        console.log(this.error)
      }
    })
  }

  showUserDetail (id: number) {
    this.dialog.open(UserDetailsComponent, {
      data: {
        id
      }
    })
  }

  showFeedbackDetails (feedback: any, id: number) {
    this.dialog.open(FeedbackDetailsComponent, {
      data: {
        feedback,
        id
      }
    })
  }

  times (numberOfTimes: number) {
    return Array(numberOfTimes).fill('★')
  }

  doesUserHaveAnActiveSession (user: { email: string, lastLoginTime: number }) {
    const SIX_HOURS_IN_SECONDS = 60 * 60 * 6
    return user.lastLoginTime && user.lastLoginTime > ((Date.now() / 1000) - SIX_HOURS_IN_SECONDS)
  }
}
