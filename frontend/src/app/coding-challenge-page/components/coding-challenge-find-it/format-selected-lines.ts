/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

export function formatSelectedLines (lines: number[]): string {
  if (lines.length === 0) return ''
  const ranges: string[] = []
  let start = lines[0]
  let end = start
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === end + 1) {
      end = lines[i]
    } else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`)
      start = lines[i]
      end = start
    }
  }
  ranges.push(start === end ? `${start}` : `${start}-${end}`)
  if (ranges.length <= 2) return ranges.join(' & ')
  return ranges.slice(0, -1).join(', ') + ' & ' + ranges[ranges.length - 1]
}
