/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, type OnInit, type AfterViewInit, type OnDestroy, Output, ViewChild, ElementRef, inject } from '@angular/core'
import { type ThemePalette } from '@angular/material/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { TranslateModule } from '@ngx-translate/core'
import { CookieService } from 'ngy-cookie'

import { EditorView } from 'codemirror'
import { EditorState, StateField, StateEffect } from '@codemirror/state'
import { Decoration, type DecorationSet, gutter, GutterMarker, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, highlightActiveLine, keymap } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { bracketMatching, defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import { getLanguageExtension, readOnlyExtensions } from '../shared/codemirror-extensions'
import { juiceShopTheme } from '../shared/codemirror-theme'

import { type CodeSnippet } from '../Services/code-snippet.service'
import { VulnLinesService, type result } from '../Services/vuln-lines.service'
import { ChallengeService } from '../Services/challenge.service'
import { ResultState } from '../coding-challenge-page/coding-challenge.types'

const toggleLineEffect = StateEffect.define<{ lineNumber: number, pos: number, on: boolean }>()

const highlightDecoration = Decoration.line({
  attributes: { class: 'cm-selected-line' }
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

class MarkerWidget extends GutterMarker {
  constructor (readonly marked: boolean) { super() }
  toDOM () {
    const el = document.createElement('span')
    el.className = 'cm-line-marker'
    el.textContent = this.marked ? '\u2705' : '\u{1F532}'
    return el
  }

  override eq (other: MarkerWidget) { return this.marked === other.marked }
}

@Component({
  selector: 'coding-challenge-find-it',
  templateUrl: './coding-challenge-find-it.component.html',
  styleUrls: ['./coding-challenge-find-it.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatCardModule, MatIconModule, TranslateModule]
})
export class CodingChallengeFindItComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('editorHost', { static: true }) editorHost!: ElementRef<HTMLDivElement>
  private editorView!: EditorView
  private readonly cdr = inject(ChangeDetectorRef)
  private readonly vulnLinesService = inject(VulnLinesService)
  private readonly challengeService = inject(ChallengeService)
  private readonly cookieService = inject(CookieService)

  @Input() challengeKey: string
  @Input() snippet: CodeSnippet
  @Input() alreadySolved = false

  @Output() solved = new EventEmitter<void>()

  public selectedLines: number[] = []
  public markedLines = new Set<number>()
  public hint: string = null
  public result: ResultState = ResultState.Undecided

  ngOnInit (): void {
    if (this.alreadySolved) {
      this.result = ResultState.Right
    }
  }

  ngAfterViewInit (): void {
    const lang = this.detectLanguage(this.snippet.snippet)
    const markerGutter = gutter({
      class: 'cm-marker-gutter',
      lineMarker: (view, line) => {
        const lineNum = view.state.doc.lineAt(line.from).number
        const marked = view.state.field(markedLinesField)
        return new MarkerWidget(marked.has(lineNum))
      }
    })
    const markerClickHandler = EditorView.domEventHandlers({
      mousedown: (event, view) => {
        const target = event.target as HTMLElement
        if (!target.closest('.cm-marker-gutter')) return false
        const pos = view.posAtCoords({ x: event.clientX, y: event.clientY })
        if (pos === null) return false
        const line = view.state.doc.lineAt(pos)
        event.preventDefault()
        this.toggleLine(view, line.number, line.from)
        return true
      }
    })

    this.editorView = new EditorView({
      parent: this.editorHost.nativeElement,
      state: EditorState.create({
        doc: this.snippet.snippet,
        extensions: [
          lineNumbers(),
          highlightActiveLineGutter(),
          highlightSpecialChars(),
          history(),
          drawSelection(),
          syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
          bracketMatching(),
          highlightActiveLine(),
          highlightSelectionMatches(),
          keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
          ...juiceShopTheme(),
          getLanguageExtension(lang),
          ...readOnlyExtensions(),
          lineHighlightField,
          markedLinesField,
          markerGutter,
          markerClickHandler
        ]
      })
    })
  }

  ngOnDestroy (): void {
    this.editorView?.destroy()
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

  private detectLanguage (code: string): string {
    if (code.includes('import ') || code.includes('export ') || code.includes(': ')) return 'typescript'
    if (code.trimStart().startsWith('{')) return 'json'
    if (code.includes(': ') && !code.includes(';')) return 'yaml'
    return 'javascript'
  }

  checkLines (): void {
    this.vulnLinesService.check(this.challengeKey, this.selectedLines).subscribe((verdict: result) => {
      this.setVerdict(verdict.verdict)
      this.hint = verdict.hint
      this.cdr.markForCheck()
    })
  }

  resultIcon (): string {
    switch (this.result) {
      case ResultState.Right:
        return 'check'
      case ResultState.Wrong:
        return 'clear'
      default:
        return 'send'
    }
  }

  resultColor (): ThemePalette {
    switch (this.resultIcon()) {
      case 'check':
        return 'accent'
      case 'clear':
        return 'warn'
    }
  }

  private setVerdict (verdict: boolean): void {
    if (this.result === ResultState.Right) return
    if (verdict) {
      this.result = ResultState.Right
      this.challengeService.continueCodeFindIt().subscribe({
        next: (continueCode) => {
          if (!continueCode) {
            throw (new Error('Received invalid continue code from the server!'))
          }
          const expires = new Date()
          expires.setFullYear(expires.getFullYear() + 1)
          this.cookieService.put('continueCodeFindIt', continueCode, { expires })
        },
        error: (err) => { console.log(err) }
      })
      import('../../confetti').then(module => {
        module.shootConfetti()
      }).then(() => {
        this.solved.emit()
      })
    } else {
      this.result = ResultState.Wrong
    }
  }
}
