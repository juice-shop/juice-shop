/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, DestroyRef, inject, input, output } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { TranslateModule } from '@ngx-translate/core'

import { ResultState } from '../../coding-challenge.types'

@Component({
  selector: 'coding-challenge-section',
  templateUrl: './coding-challenge-section.component.html',
  styleUrls: ['./coding-challenge-section.component.scss'],
  imports: [MatButtonModule, MatIconModule, TranslateModule]
})
export class CodingChallengeSectionComponent {
  private destroyed = false

  readonly title = input.required<string>()
  readonly description = input.required<string>()
  readonly solved = input(false)
  readonly result = input<ResultState>(ResultState.Undecided)
  readonly shaking = input(false)
  readonly submitDisabled = input(false)

  readonly submitClicked = output<void>()
  readonly shakingDone = output<void>()

  constructor () {
    inject(DestroyRef).onDestroy(() => { this.destroyed = true })
  }

  onShakingDone (): void {
    if (!this.destroyed) {
      this.shakingDone.emit()
    }
  }

  get ResultState () { return ResultState }

  resultIcon (): string {
    switch (this.result()) {
      case ResultState.Right:
        return 'check'
      case ResultState.Wrong:
        return 'clear'
      default:
        return 'send'
    }
  }
}
