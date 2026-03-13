/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

export const ResultState = Object.freeze({
  Undecided: 0,
  Right: 1,
  Wrong: 2
} as const)

export type ResultState = (typeof ResultState)[keyof typeof ResultState]

export interface RandomFixes {
  fix: string
  index: number
}
