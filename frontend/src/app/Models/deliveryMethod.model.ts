/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

export interface DeliveryMethod {
  id: number
  name: string
  price: number
  eta: number
  icon: string
}
