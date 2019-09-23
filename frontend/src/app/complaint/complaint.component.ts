import { environment } from '../../environments/environment'
import { ComplaintService } from '../Services/complaint.service'
import { UserService } from '../Services/user.service'
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { FileUploader } from 'ng2-file-upload'
import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { faBomb } from '@fortawesome/free-solid-svg-icons'
import { FormSubmitService } from '../Services/form-submit.service'

library.add(faBomb)
dom.watch()

@Component({
  selector: 'app-complaint',
  templateUrl: './complaint.component.html',
  styleUrls: ['./complaint.component.scss']
})
export class ComplaintComponent implements OnInit {

  public customerControl: FormControl = new FormControl({ value: '', disabled: true }, [])
  public messageControl: FormControl = new FormControl('', [Validators.required, Validators.maxLength(160)])
  @ViewChild('fileControl', { static: true }) fileControl!: ElementRef // For controlling the DOM Element for file input.
  public fileUploadError: any = undefined // For controlling error handling related to file input.
  public uploader: FileUploader = new FileUploader({
    url: environment.hostServer + '/file-upload',
    authToken: `Bearer ${localStorage.getItem('token')}`,
    allowedMimeType: [ 'application/pdf' , 'application/xml', 'text/xml' , 'application/zip', 'application/x-zip-compressed', 'multipart/x-zip'],
    maxFileSize: 100000
  })
  public userEmail: any = undefined
  public complaint: any = undefined
  public confirmation: any

  constructor (private userService: UserService, private complaintService: ComplaintService, private formSubmitService: FormSubmitService) { }

  ngOnInit () {
    this.initComplaint()
    this.uploader.onWhenAddingFileFailed = (item, filter) => {
      this.fileUploadError = filter
      throw new Error(`Error due to : ${filter.name}`)
    }
    this.uploader.onAfterAddingFile = () => {
      this.fileUploadError = undefined
    }
    this.uploader.onSuccessItem = () => {
      this.saveComplaint()
      this.uploader.clearQueue()
    }
    this.formSubmitService.attachEnterKeyHandler('complaint-form', 'submitButton',() => this.save())
  }

  initComplaint () {
    this.userService.whoAmI().subscribe((user: any) => {
      this.complaint = {}
      this.complaint.UserId = user.id
      this.userEmail = user.email
      this.customerControl.setValue(this.userEmail)
    }, (err) => {
      this.complaint = undefined
      console.log(err)
    })
  }

  save () {
    if (this.uploader.queue[0]) {
      this.uploader.queue[0].upload()
      this.fileControl.nativeElement.value = null
    } else {
      this.saveComplaint()
    }
  }

  saveComplaint () {
    this.complaint.message = this.messageControl.value
    this.complaintService.save(this.complaint).subscribe((savedComplaint: any) => {
      this.confirmation = 'Customer support will get in touch with you soon! Your complaint reference is #' + savedComplaint.id
      this.initComplaint()
      this.resetForm()
      this.fileUploadError = undefined
    }, (error) => error)
  }

  resetForm () {
    this.messageControl.setValue('')
    this.messageControl.markAsUntouched()
    this.messageControl.markAsPristine()
    this.fileControl.nativeElement.value = null
  }
}
