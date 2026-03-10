/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, type OnInit, type AfterViewInit, type OnDestroy, ElementRef, inject, input, output, viewChild } from '@angular/core'
import { type ThemePalette } from '@angular/material/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatIconModule } from '@angular/material/icon'
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { FormsModule } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'
import { CookieService } from 'ngy-cookie'

import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { unifiedMergeView } from '@codemirror/merge'
import { readOnlyExtensions, getLanguageExtension } from '../shared/codemirror-extensions'
import { juiceShopTheme } from '../shared/codemirror-theme'

import { type CodeSnippet } from '../Services/code-snippet.service'
import { CodeFixesService } from '../Services/code-fixes.service'
import { ChallengeService } from '../Services/challenge.service'
import { ResultState, type RandomFixes } from '../coding-challenge-page/coding-challenge.types'

@Component({
  selector: 'coding-challenge-fix-it',
  templateUrl: './coding-challenge-fix-it.component.html',
  styleUrls: ['./coding-challenge-fix-it.component.scss'],
  imports: [MatButtonModule, MatCardModule, MatCheckboxModule, MatIconModule, MatFormFieldModule, MatLabel, MatInputModule, FormsModule, TranslateModule]
})
export class CodingChallengeFixItComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly diffHost = viewChild.required<ElementRef<HTMLDivElement>>('diffHost')
  private diffView: EditorView | null = null

  private readonly codeFixesService = inject(CodeFixesService)
  private readonly challengeService = inject(ChallengeService)
  private readonly cookieService = inject(CookieService)

  readonly challengeKey = input.required<string>()
  readonly snippet = input.required<CodeSnippet>()
  readonly fixes = input.required<string[]>()
  readonly alreadySolved = input(false)

  readonly solved = output<void>()

  public selectedFix = 0
  public randomFixes: RandomFixes[] = []
  public explanation: string = null
  public result: ResultState = ResultState.Undecided
  public onlyChangedLines = true

  ngOnInit (): void {
    if (this.alreadySolved()) {
      this.result = ResultState.Right
    }
    this.shuffle()
  }

  ngAfterViewInit (): void {
    this.createDiffView()
  }

  ngOnDestroy (): void {
    this.diffView?.destroy()
  }

  toggleOnlyChangedLines (): void {
    this.createDiffView()
  }

  private createDiffView (): void {
    this.diffView?.destroy()
    const fix = this.randomFixes[this.selectedFix]
    if (!fix || !this.snippet()) return

    const lang = this.detectLanguage(this.snippet().snippet)
    this.diffView = new EditorView({
      parent: this.diffHost().nativeElement,
      state: EditorState.create({
        doc: fix.fix,
        extensions: [
          basicSetup,
          ...juiceShopTheme(),
          getLanguageExtension(lang),
          unifiedMergeView({
            original: this.snippet().snippet,
            highlightChanges: true,
            gutter: true,
            mergeControls: false,
            ...(this.onlyChangedLines ? { collapseUnchanged: { margin: 3, minSize: 4 } } : {})
          }),
          ...readOnlyExtensions()
        ]
      })
    })
  }

  private detectLanguage (code: string): string {
    if (code.includes('import ') || code.includes('export ') || code.includes(': ')) return 'typescript'
    if (code.trimStart().startsWith('{')) return 'json'
    if (code.includes(': ') && !code.includes(';')) return 'yaml'
    return 'javascript'
  }

  setFix (fix: number): void {
    this.selectedFix = fix
    this.explanation = null
    this.createDiffView()
  }

  changeFix (event: Event): void {
    this.setFix(parseInt((event.target as HTMLSelectElement).value, 10))
  }

  checkFix (): void {
    this.codeFixesService.check(this.challengeKey(), this.randomFixes[this.selectedFix].index).subscribe((verdict) => {
      this.setVerdict(verdict.verdict)
      this.explanation = verdict.explanation
    })
  }

  shuffle (): void {
    this.randomFixes = this.fixes()
      .map((fix, index) => ({ fix, index, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ fix, index }) => ({ fix, index }))
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
      this.challengeService.continueCodeFixIt().subscribe({
        next: (continueCode) => {
          if (!continueCode) {
            throw (new Error('Received invalid continue code from the server!'))
          }
          const expires = new Date()
          expires.setFullYear(expires.getFullYear() + 1)
          this.cookieService.put('continueCodeFixIt', continueCode, { expires })
        },
        error: (err) => { console.log(err) }
      })
      import('../../confetti').then(module => {
        module.shootConfetti()
      }).then(() => {
        this.solved.emit(undefined)
      })
    } else {
      this.result = ResultState.Wrong
    }
  }
}
