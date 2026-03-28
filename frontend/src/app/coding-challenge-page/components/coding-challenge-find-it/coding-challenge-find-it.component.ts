/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, type OnInit, type AfterViewInit, type OnDestroy, ElementRef, inject, input, output, viewChild } from '@angular/core'
import { MatCardModule } from '@angular/material/card'
import { TranslateModule } from '@ngx-translate/core'
import { CookieService } from 'ngy-cookie'

import { EditorView } from 'codemirror'
import { EditorState, StateField, StateEffect } from '@codemirror/state'
import { Decoration, type DecorationSet, lineNumbers, highlightSpecialChars, drawSelection, keymap } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { bracketMatching, defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import { getLanguageExtension, readOnlyExtensions, detectLanguage } from '../../../shared/codemirror-extensions'
import { juiceShopTheme } from '../../../shared/codemirror-theme'

import { type CodeSnippet } from '../../../Services/code-snippet.service'
import { VulnLinesService, type result } from '../../../Services/vuln-lines.service'
import { ChallengeService } from '../../../Services/challenge.service'
import { ResultState } from '../../coding-challenge.types'
import { handleVerdict } from '../../helpers/handle-verdict'
import { CodingChallengeSectionComponent } from '../coding-challenge-section/coding-challenge-section.component'
import { formatSelectedLines } from './format-selected-lines'

const toggleLineEffect = StateEffect.define<{ lineNumber: number, pos: number, on: boolean }>()
const focusLineEffect = StateEffect.define<number>()

const highlightDecoration = Decoration.line({
  attributes: { class: 'cm-selected-line' }
})

const focusDecoration = Decoration.line({
  attributes: { class: 'cm-keyboard-focused-line' }
})

const lineHighlightField = StateField.define<DecorationSet>({
  create () { return Decoration.none },
  update (decorations, tr) {
    decorations = decorations.map(tr.changes)
    for (const effect of tr.effects) {
      if (effect.is(toggleLineEffect)) {
        if (effect.value.on) {
          decorations = decorations.update({
            add: [highlightDecoration.range(effect.value.pos)]
          })
        } else {
          decorations = decorations.update({
            filter: from => from !== effect.value.pos
          })
        }
      }
    }
    return decorations
  },
  provide: f => EditorView.decorations.from(f)
})

const focusedLineField = StateField.define<number>({
  create () { return 0 },
  update (focusedLine, tr) {
    for (const effect of tr.effects) {
      if (effect.is(focusLineEffect)) {
        return effect.value
      }
    }
    return focusedLine
  }
})

const focusHighlightField = StateField.define<DecorationSet>({
  create () { return Decoration.none },
  update (_, tr) {
    for (const effect of tr.effects) {
      if (effect.is(focusLineEffect)) {
        if (effect.value === 0) return Decoration.none
        const line = tr.state.doc.line(effect.value)
        return Decoration.set([focusDecoration.range(line.from)])
      }
    }
    const lineNum = tr.state.field(focusedLineField, false)
    if (lineNum && lineNum > 0) {
      const line = tr.state.doc.line(lineNum)
      return Decoration.set([focusDecoration.range(line.from)])
    }
    return Decoration.none
  },
  provide: f => EditorView.decorations.from(f)
})

const markedLinesField = StateField.define<Set<number>>({
  create () { return new Set() },
  update (markedLines, tr) {
    for (const effect of tr.effects) {
      if (effect.is(toggleLineEffect)) {
        const next = new Set(markedLines)
        if (effect.value.on) {
          next.add(effect.value.lineNumber)
        } else {
          next.delete(effect.value.lineNumber)
        }
        return next
      }
    }
    return markedLines
  }
})


@Component({
  selector: 'coding-challenge-find-it',
  templateUrl: './coding-challenge-find-it.component.html',
  styleUrls: ['./coding-challenge-find-it.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, TranslateModule, CodingChallengeSectionComponent]
})
export class CodingChallengeFindItComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly editorHost = viewChild.required<ElementRef<HTMLDivElement>>('editorHost')
  private editorView!: EditorView
  private readonly cdr = inject(ChangeDetectorRef)
  private readonly vulnLinesService = inject(VulnLinesService)
  private readonly challengeService = inject(ChallengeService)
  private readonly cookieService = inject(CookieService)

  readonly challengeKey = input.required<string>()
  readonly snippet = input.required<CodeSnippet>()
  readonly alreadySolved = input(false)

  readonly solved = output<void>()

  get ResultState () { return ResultState }

  public selectedLines: number[] = []
  public markedLines = new Set<number>()
  public focusedLine = 0
  public showKeyboardHint = false
  public hint: string = null
  public result: ResultState = ResultState.Undecided
  public shaking = false

  ngOnInit (): void {
    if (this.alreadySolved()) {
      this.result = ResultState.Right
    }
  }

  ngAfterViewInit (): void {
    const lang = detectLanguage(this.snippet().snippet)
    const findItTheme = EditorView.theme({
      '.cm-selected-line': {
        backgroundColor: 'rgba(255, 213, 79, 0.25) !important'
      },
      '.cm-keyboard-focused-line': {
        backgroundColor: 'rgba(100, 181, 246, 0.25) !important',
        outline: '1px solid rgba(100, 181, 246, 0.5)'
      },
      '.cm-line:hover': {
        backgroundColor: 'rgba(100, 181, 246, 0.25) !important',
        outline: '1px solid rgba(100, 181, 246, 0.5)'
      },
      '.cm-selected-line.cm-keyboard-focused-line': {
        backgroundColor: 'rgba(156, 204, 101, 0.3) !important',
        outline: '1px solid rgba(156, 204, 101, 0.6)'
      },
      '.cm-selected-line:hover': {
        backgroundColor: 'rgba(156, 204, 101, 0.3) !important',
        outline: '1px solid rgba(156, 204, 101, 0.6)'
      },
      '.cm-content': {
        cursor: 'pointer'
      },
      '.cm-lineNumbers .cm-gutterElement': {
        cursor: 'pointer'
      }
    })
    const gutterClickHandler = lineNumbers({
      domEventHandlers: {
        mousedown: (view, blockInfo, event) => {
          const line = view.state.doc.lineAt(blockInfo.from)
          event.preventDefault()
          this.toggleLine(view, line.number, line.from)
          return true
        }
      }
    })
    const lineClickHandler = EditorView.domEventHandlers({
      mousedown: (event, view) => {
        const target = event.target as HTMLElement
        if (!target.closest('.cm-content')) return false
        const pos = view.posAtCoords({ x: event.clientX, y: event.clientY })
        if (pos === null) return false
        const line = view.state.doc.lineAt(pos)
        event.preventDefault()
        this.toggleLine(view, line.number, line.from)
        return true
      }
    })

    this.editorView = new EditorView({
      parent: this.editorHost().nativeElement,
      state: EditorState.create({
        doc: this.snippet().snippet,
        extensions: [
          gutterClickHandler,
          highlightSpecialChars(),
          history(),
          drawSelection(),
          syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
          bracketMatching(),
          highlightSelectionMatches(),
          keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
          ...juiceShopTheme(),
          getLanguageExtension(lang),
          ...readOnlyExtensions(),
          lineHighlightField,
          markedLinesField,
          focusedLineField,
          focusHighlightField,
          findItTheme,
          lineClickHandler
        ]
      })
    })
    this.editorView.dom.setAttribute('tabindex', '0')
    this.editorView.dom.setAttribute('role', 'listbox')
    this.editorView.dom.setAttribute('aria-label', 'Code lines - use arrow keys to navigate, space to select')
    this.editorView.dom.setAttribute('aria-multiselectable', 'true')
    this.editorView.dom.addEventListener('keydown', this.onKeydown)
    this.editorView.dom.addEventListener('focus', this.onEditorFocus)
    this.editorView.dom.addEventListener('blur', this.onEditorBlur)
  }

  ngOnDestroy (): void {
    this.editorView?.dom.removeEventListener('keydown', this.onKeydown)
    this.editorView?.dom.removeEventListener('focus', this.onEditorFocus)
    this.editorView?.dom.removeEventListener('blur', this.onEditorBlur)
    this.editorView?.destroy()
  }

  private readonly onEditorFocus = (): void => {
    this.showKeyboardHint = true
    this.cdr.markForCheck()
  }

  private readonly onEditorBlur = (): void => {
    this.showKeyboardHint = false
    this.cdr.markForCheck()
  }

  private dismissKeyboardHint (): void {
    if (this.showKeyboardHint) {
      this.showKeyboardHint = false
      this.cdr.markForCheck()
    }
  }

  private readonly onKeydown = (event: KeyboardEvent): void => {
    const view = this.editorView
    if (!view) return
    if (event.key === 'ArrowDown') {
      this.dismissKeyboardHint()
      const current = view.state.field(focusedLineField)
      const totalLines = view.state.doc.lines
      const next = current === 0 ? 1 : Math.min(current + 1, totalLines)
      this.setFocusedLine(view, next)
      event.preventDefault()
    } else if (event.key === 'ArrowUp') {
      this.dismissKeyboardHint()
      const current = view.state.field(focusedLineField)
      const next = current <= 1 ? 1 : current - 1
      this.setFocusedLine(view, next)
      event.preventDefault()
    } else if (event.key === ' ') {
      const current = view.state.field(focusedLineField)
      if (current === 0) return
      const line = view.state.doc.line(current)
      this.toggleLine(view, line.number, line.from)
      event.preventDefault()
    }
  }

  private setFocusedLine (view: EditorView, lineNumber: number): void {
    const line = view.state.doc.line(lineNumber)
    view.dispatch({
      effects: [
        focusLineEffect.of(lineNumber),
        EditorView.scrollIntoView(line.from, { y: 'nearest' })
      ]
    })
    this.focusedLine = lineNumber
    this.cdr.markForCheck()
  }

  private toggleLine (view: EditorView, lineNumber: number, lineFrom: number): void {
    const isMarked = view.state.field(markedLinesField).has(lineNumber)

    view.dispatch({
      effects: toggleLineEffect.of({ lineNumber, pos: lineFrom, on: !isMarked })
    })

    this.markedLines = view.state.field(markedLinesField)
    this.selectedLines = Array.from(this.markedLines).sort((a, b) => a - b)
    this.cdr.markForCheck()
  }

  selectLines (lineNumber: number): void {
    if (!this.editorView) return
    const line = this.editorView.state.doc.line(lineNumber)
    this.toggleLine(this.editorView, lineNumber, line.from)
  }

  checkLines (): void {
    this.vulnLinesService.check(this.challengeKey(), this.selectedLines).subscribe((verdict: result) => {
      this.setVerdict(verdict.verdict)
      this.hint = verdict.hint
      this.cdr.markForCheck()
    })
  }

  formatSelectedLines (): string {
    return formatSelectedLines(this.selectedLines)
  }

  private setVerdict (verdict: boolean): void {
    if (this.result === ResultState.Right) return
    handleVerdict({
      verdict,
      variant: 'FindIt',
      challengeService: this.challengeService,
      cookieService: this.cookieService,
      solved: this.solved,
      setResult: (r) => { this.result = r },
      setShaking: (s) => { this.shaking = s }
    })
  }
}
