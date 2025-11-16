/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { CodeSnippetService, type CodeSnippet } from '../Services/code-snippet.service'
import { CodeFixesService } from '../Services/code-fixes.service'
import { CookieService } from 'ngy-cookie'
import { ChallengeService } from '../Services/challenge.service'
import { VulnLinesService, type result } from '../Services/vuln-lines.service'
import { Component, type OnInit, inject } from '@angular/core'

import { MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog'
import { UntypedFormControl, FormsModule } from '@angular/forms'
import { ConfigurationService } from '../Services/configuration.service'
import { type ThemePalette } from '@angular/material/core'
import { MatIconButton, MatButtonModule } from '@angular/material/button'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field'

import { MatCardModule } from '@angular/material/card'
import { CodeFixesComponent } from '../code-fixes/code-fixes.component'
import { MatIconModule } from '@angular/material/icon'
import { TranslateModule } from '@ngx-translate/core'
import { CodeAreaComponent } from '../code-area/code-area.component'

import { MatTabGroup, MatTab, MatTabLabel } from '@angular/material/tabs'

enum ResultState {
  Undecided,
  Right,
  Wrong,
}

export interface Solved {
  findIt: boolean
  fixIt: boolean
}

export interface RandomFixes {
  fix: string
  index: number
}

@Component({
  selector: 'code-snippet',
  templateUrl: './code-snippet.component.html',
  styleUrls: ['./code-snippet.component.scss'],
  host: { class: 'code-snippet' },
  imports: [MatDialogTitle, MatDialogContent, MatTabGroup, MatTab, CodeAreaComponent, TranslateModule, MatTabLabel, MatIconModule, CodeFixesComponent, MatDialogActions, MatCardModule, MatFormFieldModule, MatLabel, MatInputModule, FormsModule, MatIconButton, MatButtonModule, MatDialogClose]
})
export class CodeSnippetComponent implements OnInit {
  dialogData = inject(MAT_DIALOG_DATA);
  private readonly configurationService = inject(ConfigurationService);
  private readonly codeSnippetService = inject(CodeSnippetService);
  private readonly vulnLinesService = inject(VulnLinesService);
  private readonly codeFixesService = inject(CodeFixesService);
  private readonly challengeService = inject(ChallengeService);
  private readonly cookieService = inject(CookieService);

  public snippet: CodeSnippet = null
  public fixes: string [] = null
  public selectedLines: number[]
  public selectedFix = 0
  public tab: UntypedFormControl = new UntypedFormControl(0)
  public lock: ResultState = ResultState.Undecided
  public result: ResultState = ResultState.Undecided
  public hint: string = null
  public explanation: string = null
  public solved: Solved = { findIt: false, fixIt: false }
  public showFeedbackButtons = true
  public randomFixes: RandomFixes[] = []

  ngOnInit (): void {
    this.configurationService.getApplicationConfiguration().subscribe({
      next: (config) => {
        this.showFeedbackButtons = config.challenges.showFeedbackButtons
      },
      error: (err) => { console.log(err) }
    })

    this.codeSnippetService.get(this.dialogData.key).subscribe({
      next: (snippet) => {
        this.snippet = snippet
        this.solved.findIt = false
        if (this.dialogData.codingChallengeStatus >= 1) {
          this.result = ResultState.Right
          this.lock = ResultState.Right
          this.solved.findIt = true
        }
      },
      error: (err) => {
        this.snippet = { snippet: err.error }
      }
    })
    this.codeFixesService.get(this.dialogData.key).subscribe({
      next: (fixes) => {
        this.fixes = fixes.fixes
        if (this.fixes) {
          this.shuffle()
        }
        this.solved.fixIt = this.dialogData.codingChallengeStatus >= 2
      },
      error: () => {
        this.fixes = null
      }
    })
  }

  addLine = (lines: number[]) => {
    this.selectedLines = lines
  }

  setFix = (fix: number) => {
    this.selectedFix = fix
    this.explanation = null
  }

  changeFix (event: Event) {
    this.setFix(parseInt((event.target as HTMLSelectElement).value, 10))
  }

  toggleTab = (event: number) => {
    this.tab.setValue(event)
    this.result = ResultState.Undecided
    if (event === 0) {
      if (this.solved.findIt) this.result = ResultState.Right
    }
    if (event === 1) {
      if (this.solved.fixIt) this.result = ResultState.Right
    }
  }

  checkFix = () => {
    this.codeFixesService.check(this.dialogData.key, this.randomFixes[this.selectedFix].index).subscribe((verdict) => {
      this.setVerdict(verdict.verdict)
      this.explanation = verdict.explanation
    })
  }

  checkLines = () => {
    this.vulnLinesService.check(this.dialogData.key, this.selectedLines).subscribe((verdict: result) => {
      this.setVerdict(verdict.verdict)
      this.hint = verdict.hint
    })
  }

  lockIcon (): string {
    if (this.fixes === null) {
      return 'lock'
    }
    switch (this.lock) {
      case ResultState.Right:
        return 'lock_open'
      case ResultState.Wrong:
        return 'lock'
      case ResultState.Undecided:
        return 'lock'
    }
  }

  lockColor (): ThemePalette {
    switch (this.lockIcon()) {
      case 'lock_open':
        return 'accent'
      case 'lock':
        return 'warn'
    }
  }

  shuffle () {
    this.randomFixes = this.fixes
      .map((fix, index) => ({ fix, index, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ fix, index }) => ({ fix, index }))
  }

  setVerdict = (verdict: boolean) => {
    if (this.result === ResultState.Right) return
    if (verdict) {
      if (this.tab.value === 0) {
        this.solved.findIt = true
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
      } else {
        this.solved.fixIt = true
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
      }
      this.result = ResultState.Right
      this.lock = ResultState.Right
      import('../../confetti').then(module => {
        module.shootConfetti()
      })
        .then(() => {
          if (this.tab.value === 0 && this.fixes !== null) this.toggleTab(1)
        })
    } else {
      this.result = ResultState.Wrong
    }
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
}
