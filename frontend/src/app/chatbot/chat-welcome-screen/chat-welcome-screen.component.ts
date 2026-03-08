/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, ChangeDetectionStrategy, output, model } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { ChatInputBoxComponent } from '../chat-input-box/chat-input-box.component'

@Component({
  standalone: true,
  selector: 'app-chat-welcome-screen',
  templateUrl: './chat-welcome-screen.component.html',
  styleUrls: ['./chat-welcome-screen.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIconModule,
    ChatInputBoxComponent
  ]
})
export class ChatWelcomeScreenComponent {
  message = model('')
  messageSent = output<string>()

  applySuggestion (text: string) {
    this.message.set(text)
  }
}
