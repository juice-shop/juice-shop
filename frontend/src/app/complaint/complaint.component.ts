/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { ComplaintService } from '../Services/complaint.service'
import { UserService } from '../Services/user.service'
import { Component, ElementRef, type OnInit, ViewChild, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule, UntypedFormControl, Validators } from '@angular/forms'
import { FileUploader, FileUploadModule } from 'ng2-file-upload'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faBomb } from '@fortawesome/free-solid-svg-icons'
import { FormSubmitService } from '../Services/form-submit.service'
import { TranslateService, TranslateModule } from '@ngx-translate/core'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service' // <--- 1. Import Helper

// --- REPLACEMENT FOR SHARED MODULE ---
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatSnackBarModule } from '@angular/material/snack-bar' // <--- 2. Import Module
// -------------------------------------

library.add(faBomb)

@Component({
  selector: 'app-complaint',
  templateUrl: './complaint.component.html',
  styleUrls: ['./complaint.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    FileUploadModule,
    TranslateModule,
    MatSnackBarModule // <--- 3. Add to Imports
  ]
})
export class ComplaintComponent implements OnInit {
  private readonly userService = inject(UserService)
  private readonly complaintService = inject(ComplaintService)
  private readonly formSubmitService = inject(FormSubmitService)
  private readonly translate = inject(TranslateService)
  private readonly snackBarHelperService = inject(SnackBarHelperService) // <--- 4. Inject Service

  public customerControl: UntypedFormControl = new UntypedFormControl({ value: '', disabled: true }, [])
  public messageControl: UntypedFormControl = new UntypedFormControl('', [Validators.required, Validators.maxLength(160)])
  @ViewChild('fileControl', { static: true }) fileControl!: ElementRef
  public fileUploadError: any = undefined
  public uploader: FileUploader = new FileUploader({
    url: environment.hostServer + '/file-upload',
    authToken: `Bearer ${localStorage.getItem('token')}`,
    allowedMimeType: ['application/pdf', 'application/xml', 'text/xml', 'application/zip', 'application/x-zip-compressed', 'multipart/x-zip', 'application/yaml', 'application/x-yaml', 'text/yaml', 'text/x-yaml'],
    maxFileSize: 100000
  })

  public userEmail: any = undefined
  public complaint: any = undefined
  public confirmation: any

  ngOnInit (): void {
    this.initComplaint()

    // 1. Handle File Add Failure (e.g. file too big)
    this.uploader.onWhenAddingFileFailed = (item, filter) => {
      this.fileUploadError = filter
      throw new Error(`Error due to : ${filter.name}`)
    }

    // 2. Clear errors when adding a new file
    this.uploader.onAfterAddingFile = () => {
      this.fileUploadError = undefined
    }

    // 3. Handle Success (Save the text part)
    this.uploader.onSuccessItem = () => {
      this.saveComplaint()
      this.uploader.clearQueue()
    }

    // 4. NEW: Handle Upload Failure (Crucial Fix!)
    this.uploader.onErrorItem = (item, response, status, headers) => {
        console.error('File Upload Failed:', response, status);
        // Show a red popup so we know it failed
        this.snackBarHelperService.open('File upload failed! Check console for details.', 'errorBar');
    }

    this.formSubmitService.attachEnterKeyHandler('complaint-form', 'submitButton', () => { this.save() })
  }

  initComplaint () {
    this.userService.whoAmI().subscribe({
      next: (user: any) => {
        this.complaint = {}
        this.complaint.UserId = user.id
        this.userEmail = user.email
        this.customerControl.setValue(this.userEmail)
      },
      error: (err) => {
        this.complaint = undefined
        console.log(err)
      }
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
    this.complaintService.save(this.complaint).subscribe({
      next: (savedComplaint: any) => {
        this.translate.get('CUSTOMER_SUPPORT_COMPLAINT_REPLY', { ref: savedComplaint.id }).subscribe({
          next: (customerSupportReply) => {
            // FIX: This line actually shows the Green Popup!
            this.snackBarHelperService.open(customerSupportReply, 'confirmBar')
            this.confirmation = customerSupportReply
          },
          error: (translationId) => {
            this.snackBarHelperService.open(translationId, 'confirmBar')
            this.confirmation = translationId
          }
        })
        this.initComplaint()
        this.resetForm()
        this.fileUploadError = undefined
      },
      error: (error) => {
        console.log('Complaint Save Failed:', error)
      }
    })
  }

  resetForm () {
    this.messageControl.setValue('')
    this.messageControl.markAsUntouched()
    this.messageControl.markAsPristine()
    this.fileControl.nativeElement.value = null
  }
}