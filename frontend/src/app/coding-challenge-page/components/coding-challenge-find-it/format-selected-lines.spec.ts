/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { formatSelectedLines } from './format-selected-lines'

describe('formatSelectedLines', () => {
    it('should return empty string for no lines', () => {
        expect(formatSelectedLines([])).toBe('')
    })

    it('should return single line number', () => {
        expect(formatSelectedLines([5])).toBe('5')
    })

    it('should join two individual lines with &', () => {
        expect(formatSelectedLines([1, 3])).toBe('1 & 3')
    })

    it('should collapse consecutive lines into a range', () => {
        expect(formatSelectedLines([5, 6, 7, 8])).toBe('5-8')
    })

    it('should handle a mix of ranges and individual lines', () => {
        expect(formatSelectedLines([1, 2, 5, 6, 7, 8, 10])).toBe('1-2, 5-8 & 10')
    })

    it('should join two ranges with &', () => {
        expect(formatSelectedLines([1, 2, 5, 6])).toBe('1-2 & 5-6')
    })

    it('should handle three separate individual lines', () => {
        expect(formatSelectedLines([1, 3, 5])).toBe('1, 3 & 5')
    })

    it('should handle range followed by individual line followed by range', () => {
        expect(formatSelectedLines([1, 2, 3, 5, 7, 8, 9])).toBe('1-3, 5 & 7-9')
    })

    it('should handle many individual lines', () => {
        expect(formatSelectedLines([1, 3, 5, 7, 9])).toBe('1, 3, 5, 7 & 9')
    })
})
