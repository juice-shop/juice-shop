/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { FormControl, Validators } from '@angular/forms'
import { Component, OnInit } from '@angular/core'
import { FormSubmitService } from '../Services/form-submit.service'
import { AddressService } from '../Services/address.service'
import { ActivatedRoute, ParamMap, Router } from '@angular/router'
import { Location } from '@angular/common'
import { TranslateService } from '@ngx-translate/core'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'

@Component({
  selector: 'app-address-create',
  templateUrl: './address-create.component.html',
  styleUrls: ['./address-create.component.scss']
})
export class AddressCreateComponent implements OnInit {

  public countryControl: FormControl = new FormControl('', [Validators.required])
  public nameControl: FormControl = new FormControl('', [Validators.required])
  public numberControl: FormControl = new FormControl('',[Validators.required,Validators.min(1111111),Validators.max(9999999999)])
  public pinControl: FormControl = new FormControl('',[Validators.required, Validators.maxLength(8)])
  public addressControl: FormControl = new FormControl('', [Validators.required, Validators.maxLength(160)])
  public cityControl: FormControl = new FormControl('', [Validators.required])
  public stateControl: FormControl = new FormControl()
  public address: any = undefined
  public mode = 'create'
  private addressId: string = undefined

  constructor (private location: Location, private formSubmitService: FormSubmitService,
    private addressService: AddressService, private router: Router, public activatedRoute: ActivatedRoute,
    private translate: TranslateService, private snackBarHelperService: SnackBarHelperService) { }

  ngOnInit () {
    this.address = {}
    this.activatedRoute.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('addressId')) {
        this.mode = 'edit'
        this.addressId = paramMap.get('addressId')
        this.addressService.getById(this.addressId).subscribe((address) => {
          this.initializeForm(address)
        })
      } else {
        this.mode = 'create'
        this.addressId = null
      }
    })
    this.formSubmitService.attachEnterKeyHandler('address-form', 'submitButton', () => this.save())
  }

  save () {
    this.address.country = this.countryControl.value
    this.address.fullName = this.nameControl.value
    this.address.mobileNum = this.numberControl.value
    this.address.zipCode = this.pinControl.value
    this.address.streetAddress = this.addressControl.value
    this.address.city = this.cityControl.value
    this.address.state = this.stateControl.value
    if (this.mode === 'edit') {
      this.addressService.put(this.addressId, this.address).subscribe((savedAddress) => {
        this.address = {}
        this.ngOnInit()
        this.resetForm()
        this.routeToPreviousUrl()
        this.translate.get('ADDRESS_UPDATED',{ city: savedAddress.city }).subscribe((addressUpdated) => {
          this.snackBarHelperService.open(addressUpdated, 'confirmBar')
        }, (translationId) => {
          this.snackBarHelperService.open(translationId, 'confirmBar')
        })
      }, (err) => {
        this.snackBarHelperService.open(err.error?.error, 'errorBar')
        this.address = {}
        this.resetForm()
      })
    } else {
      this.addressService.save(this.address).subscribe((savedAddress) => {
        this.address = {}
        this.ngOnInit()
        this.resetForm()
        this.routeToPreviousUrl()
        this.translate.get('ADDRESS_ADDED',{ city: savedAddress.city }).subscribe((addressAdded) => {
          this.snackBarHelperService.open(addressAdded, 'confirmBar')
        }, (translationId) => {
          this.snackBarHelperService.open(translationId, 'confirmBar')
        })
      }, (err) => {
        this.snackBarHelperService.open(err.error?.error, 'errorBar')
        this.address = {}
        this.resetForm()
      })
    }
  }

  initializeForm (address) {
    this.countryControl.setValue(address.country)
    this.nameControl.setValue(address.fullName)
    this.numberControl.setValue(address.mobileNum)
    this.pinControl.setValue(address.zipCode)
    this.addressControl.setValue(address.streetAddress)
    this.cityControl.setValue(address.city)
    this.stateControl.setValue(address.state)
  }

  routeToPreviousUrl () {
    this.location.back()
  }

  resetForm () {
    this.countryControl.markAsUntouched()
    this.countryControl.markAsPristine()
    this.countryControl.setValue('')
    this.nameControl.markAsUntouched()
    this.nameControl.markAsPristine()
    this.nameControl.setValue('')
    this.numberControl.markAsUntouched()
    this.numberControl.markAsPristine()
    this.numberControl.setValue('')
    this.pinControl.markAsUntouched()
    this.pinControl.markAsPristine()
    this.pinControl.setValue('')
    this.addressControl.markAsUntouched()
    this.addressControl.markAsPristine()
    this.addressControl.setValue('')
    this.cityControl.markAsUntouched()
    this.cityControl.markAsPristine()
    this.cityControl.setValue('')
    this.stateControl.markAsUntouched()
    this.stateControl.markAsPristine()
    this.stateControl.setValue('')
  }
}
