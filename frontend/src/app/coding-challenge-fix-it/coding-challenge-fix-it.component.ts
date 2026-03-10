/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, EventEmitter, Input, type OnInit, Output, ViewChild, type DoCheck, KeyValueDiffers, type KeyValueDiffer, inject } from '@angular/core'
import { type ThemePalette } from '@angular/material/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { FormsModule } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'
import { NgxTextDiffComponent, NgxTextDiffModule, type DiffTableFormat } from '@winarg/ngx-text-diff'
import { CookieService } from 'ngy-cookie'

import { type CodeSnippet } from '../Services/code-snippet.service'
import { CodeFixesService } from '../Services/code-fixes.service'
import { ChallengeService } from '../Services/challenge.service'
import { ResultState, type RandomFixes } from '../coding-challenge-page/coding-challenge.types'

@Component({
  selector: 'coding-challenge-fix-it',
  templateUrl: './coding-challenge-fix-it.component.html',
  styleUrls: ['./coding-challenge-fix-it.component.scss'],
  imports: [NgxTextDiffModule, MatButtonModule, MatCardModule, MatIconModule, MatFormFieldModule, MatLabel, MatInputModule, FormsModule, TranslateModule]
})
export class CodingChallengeFixItComponent implements OnInit, DoCheck {
  private readonly codeFixesService = inject(CodeFixesService)
  private readonly challengeService = inject(ChallengeService)
  private readonly cookieService = inject(CookieService)
  private readonly differs = inject(KeyValueDiffers)

  differ: KeyValueDiffer<string, DiffTableFormat>

  @Input() challengeKey: string
  @Input() snippet: CodeSnippet
  @Input() fixes: string[]
  @Input() alreadySolved = false

  @Output() solved = new EventEmitter<void>()

  public selectedFix = 0
  public randomFixes: RandomFixes[] = []
  public explanation: string = null
  public result: ResultState = ResultState.Undecided
  public format = 'SideBySide'

  @ViewChild('codeComponent', { static: false }) codeComponent: NgxTextDiffComponent

  constructor () {
    this.differ = this.differs.find({}).create()
  }

  ngOnInit (): void {
    if (this.alreadySolved) {
      this.result = ResultState.Right
    }
    this.shuffle()

    if (this.cookieService.hasKey('code-fixes-component-format')) {
      this.format = this.cookieService.get('code-fixes-component-format')
    } else {
      this.format = 'LineByLine'
      this.cookieService.put('code-fixes-component-format', 'LineByLine')
    }
  }

  ngDoCheck () {
    if (!this.codeComponent) return
    try {
      const change = this.differ.diff({ 'diff-format': this.codeComponent.format })
      if (change) {
        change.forEachChangedItem(item => {
          this.format = item.currentValue
          this.cookieService.put('code-fixes-component-format', this.format)
        })
      }
    } catch {
      console.warn('Error during diffing')
    }
  }

  setFix (fix: number): void {
    this.selectedFix = fix
    this.explanation = null
  }

  changeFix (event: Event): void {
    this.setFix(parseInt((event.target as HTMLSelectElement).value, 10))
  }

  checkFix (): void {
    this.codeFixesService.check(this.challengeKey, this.randomFixes[this.selectedFix].index).subscribe((verdict) => {
      this.setVerdict(verdict.verdict)
      this.explanation = verdict.explanation
    })
  }

  shuffle (): void {
    this.randomFixes = this.fixes
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
        this.solved.emit()
      })
    } else {
      this.result = ResultState.Wrong
    }
  }
}
