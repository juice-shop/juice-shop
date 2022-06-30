/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { ComplaintService } from '../Services/complaint.service'
import { UserService } from '../Services/user.service'
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { UntypedFormControl, Validators } from '@angular/forms'
import { FileUploader } from 'ng2-file-upload'
import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { faBomb } from '@fortawesome/free-solid-svg-icons'
import { FormSubmitService } from '../Services/form-submit.service'
import { TranslateService } from '@ngx-translate/core'

library.add(faBomb)
dom.watch()

@Component({
  selector: 'app-complaint',
  templateUrl: './complaint.component.html',
  styleUrls: ['./complaint.component.scss']
})
export class ComplaintComponent implements OnInit {
  public customerControl: UntypedFormControl = new UntypedFormControl({ value: '', disabled: true }, [])
  public messageControl: UntypedFormControl = new UntypedFormControl('', [Validators.required, Validators.maxLength(160)])
  @ViewChild('fileControl', { static: true }) fileControl!: ElementRef // For controlling the DOM Element for file input.
  public fileUploadError: any = undefined // For controlling error handling related to file input.
  public uploader: FileUploader = new FileUploader({
    url: environment.hostServer + '/file-upload',
    authToken: `Bearer ${localStorage.getItem('token')}`,
    allowedMimeType: ['application/pdf', 'application/xml', 'text/xml', 'application/zip', 'application/x-zip-compressed', 'multipart/x-zip'],
    maxFileSize: 100000
  })

  public userEmail: any = undefined
  public complaint: any = undefined
  public confirmation: any

  constructor (private readonly userService: UserService, private readonly complaintService: ComplaintService, private readonly formSubmitService: FormSubmitService, private readonly translate: TranslateService) { }

  ngOnInit () {
    this.initComplaint()
    this.uploader.onWhenAddingFileFailed = (item, filter) => {
      this.fileUploadError = filter
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Error due to : ${filter.name}`)
    }
    this.uploader.onAfterAddingFile = () => {
      this.fileUploadError = undefined
    }
    this.uploader.onSuccessItem = () => {
      this.saveComplaint()
      this.uploader.clearQueue()
    }
    this.formSubmitService.attachEnterKeyHandler('complaint-form', 'submitButton', () => this.save())
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
      this.translate.get('CUSTOMER_SUPPORT_COMPLAINT_REPLY', { ref: savedComplaint.id }).subscribe((customerSupportReply) => {
        this.confirmation = customerSupportReply
      }, (translationId) => {
        this.confirmation = translationId
      })
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
