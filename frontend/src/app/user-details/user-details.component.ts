import { UserService } from '../Services/user.service'
import { Component, OnInit, Inject } from '@angular/core'
import { MAT_DIALOG_DATA } from '@angular/material/dialog'
import fontawesome from '@fortawesome/fontawesome'
import { faArrowCircleLeft } from '@fortawesome/fontawesome-free-solid'
fontawesome.library.add(faArrowCircleLeft)

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit {

  public user: any
  constructor (@Inject(MAT_DIALOG_DATA) public dialogData: any,private userService: UserService) { }

  ngOnInit () {
    this.userService.get(this.dialogData.id).subscribe((user) => {
      this.user = user
    },(err) => console.log(err))
  }

}
