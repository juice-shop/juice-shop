/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { styleText } from 'node:util'

type Format = Parameters<typeof styleText>[0]

const style = (format: Format) => (text: unknown) => styleText(format, String(text))

export default {
  bold: style('bold'),
  italic: style('italic'),
  red: style('red'),
  green: style('green'),
  yellow: style('yellow'),
  cyan: style('cyan'),
  grey: style('gray')
}
