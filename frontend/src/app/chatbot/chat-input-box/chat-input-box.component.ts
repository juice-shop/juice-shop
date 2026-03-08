/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, ChangeDetectionStrategy, input, output, model } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { TextFieldModule } from '@angular/cdk/text-field'
import { TranslateModule } from '@ngx-translate/core'

@Component({
  standalone: true,
  selector: 'app-chat-input-box',
  templateUrl: './chat-input-box.component.html',
  styleUrls: ['./chat-input-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    TextFieldModule,
    TranslateModule
  ]
})
export class ChatInputBoxComponent {
  message = model('')
  disabled = input(false)
  messageSent = output<string>()

  onEnterKey (event: Event) {
    const keyEvent = event as KeyboardEvent
    if (!keyEvent.shiftKey) {
      event.preventDefault()
      this.send()
    }
  }

  send () {
    const content = this.message().trim()
    if (!content || this.disabled()) return
    this.messageSent.emit(content)
  }
}
