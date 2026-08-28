/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

export type AlternateImage = {
  file: string
  format: string
} & (
  | { density: string, width?: never }
  | { width: string, density?: never }
)

export interface Product {
  id: number
  name: string
  description: string
  image: string
  price: number
  points?: number
  deluxePrice: number
  alternateImages?: AlternateImage[]
}

export type ProductTableEntry = Product & { quantity?: number }
