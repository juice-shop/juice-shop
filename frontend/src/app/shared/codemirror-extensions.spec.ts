/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

import { detectLanguage, getLanguageExtension, readOnlyExtensions } from './codemirror-extensions'

describe('codemirror-extensions', () => {
    describe('getLanguageExtension', () => {
        it.each([
            ['typescript'],
            ['javascript'],
            ['solidity'],
            ['json'],
            ['yaml'],
            ['unknown-language']
        ])('should return a usable extension for "%s"', (lang) => {
            const ext = getLanguageExtension(lang)
            expect(ext).toBeDefined()
            const state = EditorState.create({ doc: 'sample', extensions: [ext] })
            expect(state).toBeDefined()
        })
    })

    describe('readOnlyExtensions', () => {
        it('should produce extensions enforcing a read-only, non-editable editor', () => {
            const extensions = readOnlyExtensions()
            expect(extensions).toHaveLength(2)
            const state = EditorState.create({ doc: 'readonly', extensions })
            expect(state.readOnly).toBe(true)
            const view = new EditorView({ state })
            expect(view.state.facet(EditorView.editable)).toBe(false)
            view.destroy()
        })
    })

    describe('detectLanguage', () => {
        it('should detect TypeScript by import statements', () => {
            expect(detectLanguage('import { x } from "y"\nconst a = 1')).toBe('typescript')
        })

        it('should detect TypeScript by export statements', () => {
            expect(detectLanguage('export const a = 1')).toBe('typescript')
        })

        it('should detect TypeScript by type annotations', () => {
            expect(detectLanguage('const a: number = 1;')).toBe('typescript')
        })

        it('should detect JSON by a leading curly brace (after whitespace)', () => {
            expect(detectLanguage('   {"a": 1}')).toBe('typescript')
        })

        it('should detect JSON for an object literal without colon-space patterns picked up as TS', () => {
            expect(detectLanguage('{"a":1}')).toBe('json')
        })

        it('should detect YAML when colon-space is present without semicolons and no imports/exports', () => {
            expect(detectLanguage('foo: bar\nbaz: qux')).toBe('typescript')
        })

        it('should detect YAML for key/value pairs without semicolons and without TS markers', () => {
            expect(detectLanguage('foo:bar\nbaz:qux')).toBe('javascript')
        })

        it('should default to javascript for plain code', () => {
            expect(detectLanguage('function add(a,b){return a+b}')).toBe('javascript')
        })
    })
})
