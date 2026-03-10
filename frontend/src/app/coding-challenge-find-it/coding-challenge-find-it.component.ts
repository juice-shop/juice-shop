/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, type OnInit, Output, inject } from '@angular/core'
import { type ThemePalette } from '@angular/material/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { TranslateModule } from '@ngx-translate/core'
import { HighlightModule } from 'ngx-highlightjs'
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers'
import { CookieService } from 'ngy-cookie'

import { type CodeSnippet } from '../Services/code-snippet.service'
import { VulnLinesService, type result } from '../Services/vuln-lines.service'
import { ChallengeService } from '../Services/challenge.service'
import { ResultState } from '../coding-challenge-page/coding-challenge.types'

interface LineMarker {
  marked: boolean
  lineNumber: number
}

@Component({
  selector: 'coding-challenge-find-it',
  templateUrl: './coding-challenge-find-it.component.html',
  styleUrls: ['./coding-challenge-find-it.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HighlightModule, HighlightLineNumbers, MatButtonModule, MatCardModule, MatIconModule, TranslateModule]
})
export class CodingChallengeFindItComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef)
  private readonly vulnLinesService = inject(VulnLinesService)
  private readonly challengeService = inject(ChallengeService)
  private readonly cookieService = inject(CookieService)

  @Input() challengeKey: string
  @Input() snippet: CodeSnippet
  @Input() alreadySolved = false

  @Output() solved = new EventEmitter<void>()

  public selectedLines: number[] = []
  public lineMarkers: LineMarker[] = []
  public hint: string = null
  public result: ResultState = ResultState.Undecided
  public langs = ['javascript', 'typescript', 'json', 'yaml']

  ngOnInit (): void {
    if (this.alreadySolved) {
      this.result = ResultState.Right
    }
    this.lineMarkers = this.snippet.snippet.split('\n').map((line, lineIndex) => ({
      lineNumber: lineIndex + 1,
      marked: false
    }))
  }

  selectLines (lineNumber: number): void {
    const marker = this.lineMarkers[lineNumber - 1]
    marker.marked = !marker.marked

    this.selectedLines = this.lineMarkers
      .filter(m => m.marked)
      .map(m => m.lineNumber)
    this.cdr.markForCheck()
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
