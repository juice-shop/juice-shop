/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, type OnInit, type AfterViewInit, type OnDestroy, ElementRef, inject, input, output, viewChild } from '@angular/core'
import { MatCardModule } from '@angular/material/card'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { FormsModule } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'
import { CookieService } from 'ngy-cookie'

import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { unifiedMergeView } from '@codemirror/merge'
import { readOnlyExtensions, getLanguageExtension, detectLanguage } from '../../../shared/codemirror-extensions'
import { juiceShopTheme } from '../../../shared/codemirror-theme'

import { type CodeSnippet } from '../../../Services/code-snippet.service'
import { CodeFixesService } from '../../../Services/code-fixes.service'
import { ChallengeService } from '../../../Services/challenge.service'
import { ResultState, type RandomFixes } from '../../coding-challenge.types'
import { handleVerdict } from '../../helpers/handle-verdict'
import { CodingChallengeSectionComponent } from '../coding-challenge-section/coding-challenge-section.component'

@Component({
  selector: 'coding-challenge-fix-it',
  templateUrl: './coding-challenge-fix-it.component.html',
  styleUrls: ['./coding-challenge-fix-it.component.scss'],
  imports: [MatButtonToggleModule, MatCardModule, MatCheckboxModule, FormsModule, TranslateModule, CodingChallengeSectionComponent]
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

  get ResultState () { return ResultState }

  public selectedFix = 0
  public randomFixes: RandomFixes[] = []
  public explanation: string = null
  public result: ResultState = ResultState.Undecided
  public shaking = false
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

    const lang = detectLanguage(this.snippet().snippet)
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

  setFix (fix: number): void {
    this.selectedFix = fix
    this.explanation = null
    this.createDiffView()
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

  resultColor (): string {
    switch (this.result) {
      case ResultState.Right:
        return 'accent'
      case ResultState.Wrong:
        return 'warn'
      default:
        return undefined
    }
  }

  private setVerdict (verdict: boolean): void {
    if (this.result === ResultState.Right) return
    handleVerdict({
      verdict,
      variant: 'FixIt',
      challengeService: this.challengeService,
      cookieService: this.cookieService,
      solved: this.solved,
      setResult: (r) => { this.result = r },
      setShaking: (s) => { this.shaking = s }
    })
  }
}
