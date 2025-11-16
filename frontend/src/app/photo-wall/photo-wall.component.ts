/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, type OnInit, inject } from '@angular/core'
import { UntypedFormControl, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { mimeType } from './mime-type.validator'
import { PhotoWallService } from '../Services/photo-wall.service'
import { ConfigurationService } from '../Services/configuration.service'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faTwitter } from '@fortawesome/free-brands-svg-icons'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { catchError } from 'rxjs/operators'
import { EMPTY } from 'rxjs'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule, MatLabel, MatError } from '@angular/material/form-field'
import { TranslateModule } from '@ngx-translate/core'
import { MatIconButton, MatButtonModule } from '@angular/material/button'

import { MatCardModule, MatCardTitle, MatCardContent } from '@angular/material/card'

library.add(faTwitter)

@Component({
  selector: 'app-photo-wall',
  templateUrl: './photo-wall.component.html',
  styleUrls: ['./photo-wall.component.scss'],
  imports: [MatCardModule, MatIconButton, MatCardTitle, TranslateModule, MatCardContent, FormsModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatLabel, MatInputModule, MatError]
})
export class PhotoWallComponent implements OnInit {
  private readonly photoWallService = inject(PhotoWallService);
  private readonly configurationService = inject(ConfigurationService);
  private readonly snackBarHelperService = inject(SnackBarHelperService);

  public emptyState = true
  public imagePreview: string
  public form: UntypedFormGroup = new UntypedFormGroup({
    image: new UntypedFormControl('', { validators: [Validators.required], asyncValidators: [mimeType] }),
    caption: new UntypedFormControl('', [Validators.required])
  })

  public slideshowDataSource: { url: string, caption: string }[] = []
  public twitterHandle = null

  ngOnInit (): void {
    this.slideshowDataSource = []
    this.photoWallService.get().pipe(catchError(err => {
      console.log(err)

      return EMPTY
    })).subscribe((memories) => {
      if (memories.length === 0) {
        this.emptyState = true
      } else {
        this.emptyState = false
      }
      for (const memory of memories) {
        if (memory.User?.username) {

          memory.caption = `${memory.caption} (© ${memory.User.username})`
        }
        this.slideshowDataSource.push({ url: memory.imagePath, caption: memory.caption })
      }
    })

    this.configurationService.getApplicationConfiguration().pipe(catchError(err => {
      console.log(err)

      return EMPTY
    })).subscribe((config) => {
      if (config?.application?.social) {
        if (config.application.social.twitterUrl) {
          this.twitterHandle = config.application.social.twitterUrl.replace('https://twitter.com/', '@')
        }
      }
    })
  }

  onImagePicked (event: Event) {
    const file = (event.target as HTMLInputElement).files[0]
    this.form.patchValue({ image: file })
    this.form.get('image').updateValueAndValidity()
    const reader = new FileReader()
    reader.onload = () => {
      this.imagePreview = reader.result as string
    }
    reader.readAsDataURL(file)
  }

  save () {
    this.photoWallService.addMemory(this.form.value.caption, this.form.value.image).subscribe({
      next: () => {
        this.resetForm()
        this.ngOnInit()
        this.snackBarHelperService.open('IMAGE_UPLOAD_SUCCESS', 'confirmBar')
      },
      error: (err) => {
        this.snackBarHelperService.open(err.error?.error, 'errorBar')
        console.log(err)
      }
    })
  }

  isLoggedIn () {
    return localStorage.getItem('token')
  }

  resetForm () {
    this.form.get('image').setValue('')
    this.form.get('image').markAsPristine()
    this.form.get('image').markAsUntouched()
    this.form.get('caption').setValue('')
    this.form.get('caption').markAsPristine()
    this.form.get('caption').markAsUntouched()
    this.form.get('caption').setErrors(null)
  }
}
