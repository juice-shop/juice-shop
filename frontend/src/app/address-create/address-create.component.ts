/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, type OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core'
import { form, FormField, FormRoot, max, maxLength, min, required } from '@angular/forms/signals'
import { firstValueFrom } from 'rxjs'
import { AddressService } from '../Services/address.service'
import { ActivatedRoute, type ParamMap, Router } from '@angular/router'
import { Location } from '@angular/common'
import { TranslateService, TranslateModule } from '@ngx-translate/core'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule, MatLabel, MatError, MatHint } from '@angular/material/form-field'
import { MatCardModule } from '@angular/material/card'

interface AddressFormModel {
  country: string
  fullName: string
  mobileNum: number | null
  zipCode: string
  streetAddress: string
  city: string
  state: string
}

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-address-create',
  templateUrl: './address-create.component.html',
  styleUrls: ['./address-create.component.scss'],
  imports: [MatCardModule, TranslateModule, MatFormFieldModule, MatLabel, MatInputModule, FormRoot, FormField, MatError, MatHint, MatButtonModule, MatIconModule]
})
export class AddressCreateComponent implements OnInit {
  private readonly location = inject(Location)
  private readonly addressService = inject(AddressService)
  private readonly router = inject(Router)
  activatedRoute = inject(ActivatedRoute)
  private readonly translate = inject(TranslateService)
  private readonly snackBarHelperService = inject(SnackBarHelperService)

  private readonly initialModel: AddressFormModel = {
    country: '',
    fullName: '',
    mobileNum: null,
    zipCode: '',
    streetAddress: '',
    city: '',
    state: ''
  }

  public readonly addressModel = signal<AddressFormModel>({ ...this.initialModel })

  public readonly addressForm = form(this.addressModel, (s) => {
    required(s.country)
    required(s.fullName)
    required(s.mobileNum)
    min(s.mobileNum, 1111111)
    max(s.mobileNum, 9999999999)
    required(s.zipCode)
    maxLength(s.zipCode, 8)
    required(s.streetAddress)
    maxLength(s.streetAddress, 160)
    required(s.city)
  }, {
    submission: {
      action: () => this.save()
    }
  })

  public mode = 'create'
  private addressId: string = undefined

  ngOnInit (): void {
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
  }

  async save () {
    const address = { ...this.addressModel() }
    const confirmationKey = this.mode === 'edit' ? 'ADDRESS_UPDATED' : 'ADDRESS_ADDED'
    try {
      const savedAddress = this.mode === 'edit'
        ? await firstValueFrom(this.addressService.put(this.addressId, address))
        : await firstValueFrom(this.addressService.save(address))
      this.resetForm()
      this.routeToPreviousUrl()
      this.snackBarHelperService.open(await this.confirmationMessage(confirmationKey, savedAddress?.city), 'confirmBar')
    } catch (err: any) {
      this.snackBarHelperService.open(err.error?.error, 'errorBar')
      this.resetForm()
    }
  }

  initializeForm (address) {
    this.addressModel.set({
      country: address.country,
      fullName: address.fullName,
      mobileNum: address.mobileNum ?? null,
      zipCode: address.zipCode,
      streetAddress: address.streetAddress,
      city: address.city,
      state: address.state ?? ''
    })
  }

  routeToPreviousUrl () {
    this.location.back()
  }

  resetForm () {
    this.addressForm().reset({ ...this.initialModel })
  }

  private async confirmationMessage (key: string, city: string): Promise<string> {
    try {
      return await firstValueFrom(this.translate.get(key, { city }))
    } catch (translationId) {
      return translationId as string
    }
  }
}
