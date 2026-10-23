/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const namedEntities: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: '\u00A0',
  copy: '©',
  reg: '®',
  trade: '™',
  euro: '€',
  pound: '£',
  yen: '¥',
  cent: '¢',
  sect: '§',
  deg: '°',
  plusmn: '±',
  para: '¶',
  middot: '·',
  laquo: '«',
  raquo: '»',
  iquest: '¿',
  iexcl: '¡',
  ndash: '–',
  mdash: '—',
  lsquo: '‘',
  rsquo: '’',
  sbquo: '‚',
  ldquo: '“',
  rdquo: '”',
  bdquo: '„',
  dagger: '†',
  Dagger: '‡',
  bull: '•',
  hellip: '…',
  prime: '′',
  Prime: '″',
  lsaquo: '‹',
  rsaquo: '›',
  oline: '‾',
  frasl: '⁄'
}

const encodeMap: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

export const encode = (text: string): string => {
  if (!text) return ''
  return String(text).replace(/[&<>"']/g, (char) => encodeMap[char] || char)
}

export const decode = (text: string): string => {
  if (!text) return ''
  return String(text)
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      try {
        return String.fromCodePoint(parseInt(hex, 16))
      } catch {
        return ''
      }
    })
    .replace(/&#([0-9]+);/g, (_, dec) => {
      try {
        return String.fromCodePoint(parseInt(dec, 10))
      } catch {
        return ''
      }
    })
    .replace(/&([a-zA-Z]+);/g, (match, name) => namedEntities[name] || match)
}

export class AllHtmlEntities {
  encode (text: string): string {
    return encode(text)
  }

  decode (text: string): string {
    return decode(text)
  }
}

export const Entities = AllHtmlEntities

export default {
  encode,
  decode,
  AllHtmlEntities,
  Entities
}
