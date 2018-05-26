import { FileUploadService } from './../Services/file-upload.service';
import { Component, OnInit } from '@angular/core';
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
  public fileUploadError = { size: false , type: false};
  constructor(private fileUploadService: FileUploadService) { }

  ngOnInit() {
  }

  fileChange(files: FileList) {
    const file: File = files[0];
    console.log(file);

    if (file.type !== 'application/pdf') {
      this.fileUploadError.type = true;
      return;
    }
    if (file.size > 102400) {
      this.fileUploadError.size = true;
      return;
    }

    /* File upload functionality  */
    // this.fileUploadService.uploadFile(file).subscribe((response) => console.log(response), (err) => console.log(err));

  }

}
