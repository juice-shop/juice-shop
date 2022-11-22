/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { ConfigurationService } from '../Services/configuration.service'
import { UserService } from '../Services/user.service'
import { RecycleService } from '../Services/recycle.service'
import { Component, OnInit, ViewChild } from '@angular/core'
import { UntypedFormControl, Validators } from '@angular/forms'
import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { FormSubmitService } from '../Services/form-submit.service'
import { AddressComponent } from '../address/address.component'
import { TranslateService } from '@ngx-translate/core'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'

library.add(faPaperPlane)
dom.watch()

@Component({
  selector: 'app-recycle',
  templateUrl: './recycle.component.html',
  styleUrls: ['./recycle.component.scss']
})
export class RecycleComponent implements OnInit {
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
  constructor (private readonly recycleService: RecycleService, private readonly userService: UserService,
    private readonly configurationService: ConfigurationService, private readonly formSubmitService: FormSubmitService,
    private readonly translate: TranslateService, private readonly snackBarHelperService: SnackBarHelperService) { }

  ngOnInit () {
    this.configurationService.getApplicationConfiguration().subscribe((config: any) => {
      if (config?.application?.recyclePage) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        this.topImage = `assets/public/images/products/${config.application.recyclePage.topProductImage}`
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        this.bottomImage = `assets/public/images/products/${config.application.recyclePage.bottomProductImage}`
      }
    }, (err) => console.log(err))

    this.initRecycle()
    this.findAll()

    this.formSubmitService.attachEnterKeyHandler('recycle-form', 'recycleButton', () => this.save())
  }

  initRecycle () {
    this.userService.whoAmI().subscribe((data) => {
      this.recycle = {}
      this.recycle.UserId = data.id
      this.userEmail = data.email
      this.requestorControl.setValue(this.userEmail)
    }, (err) => console.log(err))
  }

  save () {
    this.recycle.AddressId = this.addressId
    this.recycle.quantity = this.recycleQuantityControl.value
    if (this.pickup.value) {
      this.recycle.isPickUp = this.pickup.value
      this.recycle.date = this.pickUpDateControl.value
    }

    this.recycleService.save(this.recycle).subscribe((savedRecycle: any) => {
      if (savedRecycle.isPickup) {
        this.translate.get('CONFIRM_RECYCLING_PICKUP', { pickupdate: savedRecycle.pickupDate }).subscribe((confirmRecyclingPickup) => {
          this.snackBarHelperService.open(confirmRecyclingPickup, 'confirmBar')
        }, (translationId) => {
          this.snackBarHelperService.open(translationId, 'confirmBar')
        })
      } else {
        this.translate.get('CONFIRM_RECYCLING_BOX').subscribe((confirmRecyclingBox) => {
          this.snackBarHelperService.open(confirmRecyclingBox, 'confirmBar')
        }, (translationId) => {
          this.snackBarHelperService.open(translationId, 'confirmBar')
        })
      }
      this.addressComponent.load()
      this.initRecycle()
      this.resetForm()
    }, (err) => {
      this.snackBarHelperService.open(err.error?.error, 'errorBar')
      console.log(err)
    })
  }

  findAll () {
    this.recycleService.find().subscribe((recycles) => {
      this.recycles = recycles
    }, (error) => {
      console.log(error)
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
