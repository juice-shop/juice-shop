/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { max, maxLength, min, required, schema } from '@angular/forms/signals'

export const MIN_MOBILE_NUMBER = 1000000
export const MAX_MOBILE_NUMBER = 9999999999
export const MAX_ZIP_CODE_LENGTH = 8
export const MAX_STREET_ADDRESS_LENGTH = 160

export interface AddressFormModel {
  country: string
  fullName: string
  mobileNum: number | null
  zipCode: string
  streetAddress: string
  city: string
  state: string
}

export const addressFormSchema = schema<AddressFormModel>((s) => {
  required(s.country)
  required(s.fullName)
  required(s.mobileNum)
  min(s.mobileNum, MIN_MOBILE_NUMBER)
  max(s.mobileNum, MAX_MOBILE_NUMBER)
  required(s.zipCode)
  maxLength(s.zipCode, MAX_ZIP_CODE_LENGTH)
  required(s.streetAddress)
  maxLength(s.streetAddress, MAX_STREET_ADDRESS_LENGTH)
  required(s.city)
})
