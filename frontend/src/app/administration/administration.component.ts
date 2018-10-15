import { UserDetailsComponent } from '../user-details/user-details.component'
import { MatDialog } from '@angular/material/dialog'
import { FeedbackService } from '../Services/feedback.service'
import { RecycleService } from '../Services/recycle.service'
import { UserService } from '../Services/user.service'
import { Component, OnInit } from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'
import fontawesome from '@fortawesome/fontawesome'
import { faArchive, faEye, faHome, faTrashAlt, faUser } from '@fortawesome/fontawesome-free-solid'

fontawesome.library.add(faUser, faEye, faHome, faArchive, faTrashAlt)

@Component({
  selector: 'app-administration',
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.scss']
})
export class AdministrationComponent implements OnInit {

  public userDataSource: any
  public userColumns = ['user','email','user_detail']
  public recycleDataSource: any
  public recycleColumns = ['user', 'quantity', 'address', 'icon', 'pickup_date']
  public feedbackDataSource: any
  public feedbackColumns = ['user', 'comment', 'rating', 'remove']
  public error
  constructor (private dialog: MatDialog,private userService: UserService,private recycleService: RecycleService, private feedbackService: FeedbackService, private sanitizer: DomSanitizer) {}

  ngOnInit () {
    this.findAllUsers()
    this.findAllRecycles()
    this.findAllFeedbacks()
  }

  findAllUsers () {
    this.userService.find().subscribe((users) => {
      this.userDataSource = users
      for (let user of this.userDataSource) {
        user.email = this.sanitizer.bypassSecurityTrustHtml(user.email)
      }
    },(err) => {
      this.error = err
      console.log(this.error)
    })
  }

  findAllRecycles () {
    this.recycleService.find().subscribe((recycles) => {
      this.recycleDataSource = recycles
    },(err) => {
      this.error = err
      console.log(this.error)
    })
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
