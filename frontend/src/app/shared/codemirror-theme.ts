/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'

const juiceShopEditorTheme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--theme-background-darker)',
    color: 'var(--theme-text)',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  '.cm-content': {
    caretColor: 'var(--theme-accent)',
    fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
    fontSize: '14px'
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--theme-accent)'
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: 'var(--theme-primary-fade-30)'
  },
  '.cm-activeLine': {
    backgroundColor: 'var(--theme-background-light)'
  },
  '.cm-gutters': {
    backgroundColor: 'var(--theme-background-dark)',
    color: 'var(--theme-text-fade-50)',
    borderRight: '1px solid var(--theme-background-light)',
    borderRadius: '16px 0 0 16px'
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'var(--theme-background-light)'
  },
  '&.cm-focused .cm-matchingBracket': {
    backgroundColor: 'var(--theme-accent-fade-30)',
    outline: 'none'
  },
  '.cm-searchMatch': {
    backgroundColor: 'var(--theme-accent-fade-20)'
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: 'var(--theme-accent-fade-40)'
  },
  '.cm-foldPlaceholder': {
    backgroundColor: 'var(--theme-background-light)',
    border: 'none',
    color: 'var(--theme-text-fade-50)'
  },
  '.cm-tooltip': {
    backgroundColor: 'var(--theme-background)',
    border: '1px solid var(--theme-background-light)',
    color: 'var(--theme-text)'
  },
  '.cm-tooltip-autocomplete': {
    '& > ul > li[aria-selected]': {
      backgroundColor: 'var(--theme-primary-fade-20)'
    }
  }
}, { dark: true })

const juiceShopHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: '#c678dd' },
  { tag: [tags.name, tags.deleted, tags.character, tags.macroName], color: '#e06c75' },
  { tag: [tags.function(tags.variableName), tags.labelName], color: '#61afef' },
  { tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)], color: '#d19a66' },
  { tag: [tags.definition(tags.name), tags.separator], color: '#abb2bf' },
  { tag: [tags.typeName, tags.className, tags.number, tags.changed, tags.annotation, tags.modifier, tags.self, tags.namespace], color: '#e5c07b' },
  { tag: [tags.operator, tags.operatorKeyword, tags.url, tags.escape, tags.regexp, tags.link, tags.special(tags.string)], color: '#56b6c2' },
  { tag: [tags.meta, tags.comment], color: '#7f848e' },
  { tag: tags.strong, fontWeight: 'bold' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strikethrough, textDecoration: 'line-through' },
  { tag: tags.link, textDecoration: 'underline' },
  { tag: tags.heading, fontWeight: 'bold', color: '#e06c75' },
  { tag: [tags.atom, tags.bool, tags.special(tags.variableName)], color: '#d19a66' },
  { tag: [tags.processingInstruction, tags.string, tags.inserted], color: '#98c379' },
  { tag: tags.invalid, color: '#ffffff', backgroundColor: '#e06c75' }
])

export function juiceShopTheme () {
  return [juiceShopEditorTheme, syntaxHighlighting(juiceShopHighlightStyle)]
}
