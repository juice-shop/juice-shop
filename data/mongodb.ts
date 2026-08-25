/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

// @ts-expect-error no type definitions available for MarsDB
import * as MarsDB from 'marsdb'

export const reviewsCollection = new MarsDB.Collection('posts')
export const ordersCollection = new MarsDB.Collection('orders')
