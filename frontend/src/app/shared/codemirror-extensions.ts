/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { javascript } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'
import { yaml } from '@codemirror/lang-yaml'

export function getLanguageExtension (lang: string): Extension {
  switch (lang) {
    case 'typescript': return javascript({ typescript: true })
    case 'javascript': return javascript()
    case 'solidity': return javascript()
    case 'json': return json()
    case 'yaml': return yaml()
    default: return javascript()
  }
}

export function readOnlyExtensions (): Extension[] {
  return [
    EditorView.editable.of(false),
    EditorState.readOnly.of(true)
  ]
}
