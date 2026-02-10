/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { ConfigurationService } from '../Services/configuration.service'
import { UserService } from '../Services/user.service'
import { RecycleService } from '../Services/recycle.service'
import { Component, type OnInit, ViewChild, inject } from '@angular/core'
import { UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { FormSubmitService } from '../Services/form-submit.service'
import { AddressComponent } from '../address/address.component'
import { TranslateService, TranslateModule } from '@ngx-translate/core'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { MatButtonModule } from '@angular/material/button'
import { MatCheckbox } from '@angular/material/checkbox'
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker'

import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule, MatLabel, MatError, MatSuffix } from '@angular/material/form-field'

import { MatCardModule, MatCardImage, MatCardContent } from '@angular/material/card'

library.add(faPaperPlane)

@Component({
  selector: 'app-recycle',
  templateUrl: './recycle.component.html',
  styleUrls: ['./recycle.component.scss'],
  imports: [MatCardModule, TranslateModule, MatFormFieldModule, MatLabel, MatInputModule, FormsModule, ReactiveFormsModule, MatError, AddressComponent, MatDatepickerInput, MatDatepickerToggle, MatSuffix, MatDatepicker, MatCheckbox, MatButtonModule, MatCardImage, MatCardContent]
})
export class RecycleComponent implements OnInit {
  private readonly recycleService = inject(RecycleService);
  private readonly userService = inject(UserService);
  private readonly configurationService = inject(ConfigurationService);
  private readonly formSubmitService = inject(FormSubmitService);
  private readonly translate = inject(TranslateService);
  private readonly snackBarHelperService = inject(SnackBarHelperService);

  @ViewChild('addressComp', { static: true }) public addressComponent: AddressComponent
  public requestorControl: UntypedFormControl = new UntypedFormControl({ value: '', disabled: true }, [])
  public recycleQuantityControl: UntypedFormControl = new UntypedFormControl('', [Validators.required, Validators.min(10), Validators.max(1000)])
  public pickUpDateControl: UntypedFormControl = new UntypedFormControl()
  public pickup: UntypedFormControl = new UntypedFormControl(false)
  public topImage?: string
  public bottomImage?: string
  public recycles: any
  public recycle: any = {}
  public userEmail: any
  public confirmation: any
  public addressId: any = undefined

  ngOnInit (): void {
    this.configurationService.getApplicationConfiguration().subscribe({
      next: (config: any) => {
        if (config?.application?.recyclePage) {

          this.topImage = `assets/public/images/products/${config.application.recyclePage.topProductImage}`

          this.bottomImage = `assets/public/images/products/${config.application.recyclePage.bottomProductImage}`
        }
      },
      error: (err) => { console.log(err) }
    })

    this.initRecycle()
    this.findAll()

    this.formSubmitService.attachEnterKeyHandler('recycle-form', 'recycleButton', () => { this.save() })
  }

  initRecycle () {
    this.userService.whoAmI().subscribe({
      next: (data) => {
        this.recycle = {}
        this.recycle.UserId = data.id
        this.userEmail = data.email
        this.requestorControl.setValue(this.userEmail)
      },
      error: (err) => { console.log(err) }
    })
  }

  save () {
    this.recycle.AddressId = this.addressId
    this.recycle.quantity = this.recycleQuantityControl.value
    if (this.pickup.value) {
      this.recycle.isPickUp = this.pickup.value
      this.recycle.date = this.pickUpDateControl.value
    }

    this.recycleService.save(this.recycle).subscribe({
      next: (savedRecycle: any) => {
        if (savedRecycle.isPickup) {
          this.translate.get('CONFIRM_RECYCLING_PICKUP', { pickupdate: savedRecycle.pickupDate }).subscribe({
            next: (confirmRecyclingPickup) => {
              this.snackBarHelperService.open(confirmRecyclingPickup, 'confirmBar')
            },
            error: (translationId) => {
              this.snackBarHelperService.open(translationId, 'confirmBar')
            }
          })
        } else {
          this.translate.get('CONFIRM_RECYCLING_BOX').subscribe({
            next: (confirmRecyclingBox) => {
              this.snackBarHelperService.open(confirmRecyclingBox, 'confirmBar')
            },
            error: (translationId) => {
              this.snackBarHelperService.open(translationId, 'confirmBar')
            }
          })
        }
        this.addressComponent.load()
        this.initRecycle()
        this.resetForm()
      },
      error: (err) => {
        this.snackBarHelperService.open(err.error?.error, 'errorBar')
        console.log(err)
      }
    })
  }

  findAll () {
    this.recycleService.find().subscribe({
      next: (recycles) => {
        this.recycles = recycles
      },
      error: (error) => {
        console.log(error)
      }
    })
  }

  resetForm () {
    this.addressId = undefined
    this.recycleQuantityControl.setValue('')
    this.recycleQuantityControl.markAsPristine()
    this.recycleQuantityControl.markAsUntouched()
    this.pickUpDateControl.setValue('')
    this.pickUpDateControl.markAsPristine()
    this.pickUpDateControl.markAsUntouched()
    this.pickup.setValue(false)
  }

  getMessage (id) {
    this.addressId = id
  }
}
