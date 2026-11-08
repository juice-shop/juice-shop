/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, type OnInit, DestroyRef, inject, signal, ChangeDetectionStrategy } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { form, FormField, FormRoot } from '@angular/forms/signals'
import { catchError, EMPTY, firstValueFrom, of, switchMap } from 'rxjs'
import { addressFormSchema, type AddressFormModel, MAX_MOBILE_NUMBER, MAX_STREET_ADDRESS_LENGTH, MAX_ZIP_CODE_LENGTH, MIN_MOBILE_NUMBER } from '../Models/address-form.schema'
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
  private readonly destroyRef = inject(DestroyRef)

  public readonly maxZipCodeLength = MAX_ZIP_CODE_LENGTH
  public readonly maxStreetAddressLength = MAX_STREET_ADDRESS_LENGTH
  public readonly mobileNumberRange = `${MIN_MOBILE_NUMBER}-${MAX_MOBILE_NUMBER}`

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

  public readonly addressForm = form(this.addressModel, addressFormSchema, {
    submission: {
      action: () => this.save()
    }
  })

  public mode = 'create'
  private addressId: string = undefined

  ngOnInit (): void {
    this.activatedRoute.paramMap
      .pipe(
        switchMap((paramMap: ParamMap) => {
          if (!paramMap.has('addressId')) {
            this.mode = 'create'
            this.addressId = null
            return of(null)
          }
          this.mode = 'edit'
          this.addressId = paramMap.get('addressId')
          return this.addressService.getById(this.addressId).pipe(
            catchError((err) => {
              console.log(err)
              return EMPTY
            })
          )
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((address) => {
        if (address) {
          this.initializeForm(address)
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
    }
  }

  initializeForm (address) {
    this.addressModel.set({
      country: address.country ?? '',
      fullName: address.fullName ?? '',
      mobileNum: address.mobileNum ?? null,
      zipCode: address.zipCode ?? '',
      streetAddress: address.streetAddress ?? '',
      city: address.city ?? '',
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
