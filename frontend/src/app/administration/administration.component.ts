import { UserDetailsComponent } from '../user-details/user-details.component'
import { MatDialog } from '@angular/material/dialog'
import { FeedbackService } from '../Services/feedback.service'
import { UserService } from '../Services/user.service'
import { Component, OnInit } from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'
import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faArchive, faEye, faHome, faTrashAlt, faUser } from '@fortawesome/free-solid-svg-icons'

library.add(faUser, faEye, faHome, faArchive, faTrashAlt)
dom.watch()

@Component({
  selector: 'app-administration',
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.scss']
})
export class AdministrationComponent implements OnInit {

  public userDataSource: any
  public userColumns = ['user','email','user_detail']
  public feedbackDataSource: any
  public feedbackColumns = ['user', 'comment', 'rating', 'remove']
  public error: any
  constructor (private dialog: MatDialog, private userService: UserService, private feedbackService: FeedbackService, private sanitizer: DomSanitizer) {}

  ngOnInit () {
    this.findAllUsers()
    this.findAllRecycles()
    this.findAllFeedbacks()
  }

  findAllUsers () {
    this.userService.find().subscribe((users) => {
      this.userDataSource = users
      for (let user of this.userDataSource) {
        user.email = this.sanitizer.bypassSecurityTrustHtml(`<span class="${user.token ? 'confirmation' : 'error'}">${user.email}</span>`)
      }
    },(err) => {
      this.error = err
      console.log(this.error)
    })
  }

  findAllRecycles () {
    // TODO [2019/01/05] Move Recycles to their own page to decouple from admin-only data!
  }

  findAllFeedbacks () {
    this.feedbackService.find().subscribe((feedbacks) => {
      this.feedbackDataSource = feedbacks
      for (let feedback of this.feedbackDataSource) {
        feedback.comment = this.sanitizer.bypassSecurityTrustHtml(feedback.comment)
      }
    },(err) => {
      this.error = err
      console.log(this.error)
    })
  }

  deleteFeedback (id: number) {
    this.feedbackService.del(id).subscribe(() => {
      this.findAllFeedbacks()
    },(err) => {
      this.error = err
      console.log(this.error)
    })
  }

  showUserDetail (id: number) {
    this.dialog.open(UserDetailsComponent, {
      data: {
        id: id
      }
    })
  }

}
