import { ComplaintService } from './../Services/complaint.service';
import { UserService } from './../Services/user.service';
import { FileUploadService } from './../Services/file-upload.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import fontawesome from '@fortawesome/fontawesome';
import { faBomb } from '@fortawesome/fontawesome-free-solid';
fontawesome.library.add(faBomb);

@Component({
  selector: 'app-complaint',
  templateUrl: './complaint.component.html',
  styleUrls: ['./complaint.component.css']
})
export class ComplaintComponent implements OnInit {

  public customerControl: FormControl = new FormControl({ value: '', disabled: true}, []);
  public messageControl: FormControl = new FormControl('', [Validators.required, Validators.maxLength(160)]);
  @ViewChild('fileControl') fileControl: ElementRef; // For controlling the DOM Element for file input.
  public fileUploadError = { size: false , type: false}; // For controlling error handling related to file input.
  public file: File; // The file which is to be uploaded
  public userEmail: any;
  public complaint: any = {};
  public confirmation: any;

  constructor(private fileUploadService: FileUploadService, private userService: UserService,
  private complaintService: ComplaintService) { }

  ngOnInit() {
    this.initComplaint();
  }

  fileChange(files: FileList) {

    const file: File = files[0];
    this.file = file;

    if (file.type !== 'application/pdf') {
      this.fileUploadError.type = true;
      return;
    }
    if (file.size > 102400) {
      this.fileUploadError.size = true;
      return;
    }
  }

  initComplaint () {
    this.userService.whoAmI().subscribe((user: any) => {
      this.complaint = {};
      this.complaint.UserId = user.id;
      this.userEmail = user.email;
      this.customerControl.setValue(this.userEmail);
    }, (err) => err);
  }

  save () {
    if (this.file) {
      /* Functionality to implement file upload pending */
      /* File upload functionality  */
      /* this.fileUploadService.uploadFile(file).subscribe((response) => console.log(response), (err) => console.log(err)); */

      /* Temporarily removing alreading uploaded file */
      this.fileControl.nativeElement.value = null;
    } else {
      this.saveComplaint();
    }
  }

  saveComplaint () {
    this.complaint.message = this.messageControl.value;
    this.complaintService.save(this.complaint).subscribe( (savedComplaint: any ) => {
      this.confirmation = 'Customer support will get in touch with you soon! Your complaint reference is #' + savedComplaint.id;
      this.initComplaint();
      console.log(this.fileControl);
      this.resetForm();
    }, (error) => error);
  }

  resetForm () {
    this.messageControl.setValue('');
    this.messageControl.markAsUntouched();
    this.messageControl.markAsPristine();
    this.fileControl.nativeElement.value = null;
    this.file = undefined;
  }
}
