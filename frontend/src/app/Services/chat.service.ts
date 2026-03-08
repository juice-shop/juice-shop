/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Injectable } from '@angular/core'
import { environment } from '../../environments/environment'

export interface ChatChunk {
  deltaContent?: string
  deltaToolCalls?: ToolCall[]
  finishReason?: string | null
}

export interface ToolCall {
  id: string
  type: string
  function: { name: string, arguments: string }
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/rest/chat'

  async * streamMessages (messages: { role: string, content: string }[]): AsyncGenerator<ChatChunk> {
    const response = await fetch(this.host, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    })

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n')
      buffer = lines.pop()!

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue
        const data = trimmed.slice(6)
        if (data === '[DONE]') return

        const parsed = JSON.parse(data)
        const delta = parsed.choices?.[0]?.delta
        const finishReason = parsed.choices?.[0]?.finish_reason

        if (delta) {
          const chunk: ChatChunk = {}
          if (delta.content) chunk.deltaContent = delta.content
          if (delta.tool_calls) chunk.deltaToolCalls = delta.tool_calls
          if (finishReason) chunk.finishReason = finishReason
          if (chunk.deltaContent || chunk.deltaToolCalls || chunk.finishReason) {
            yield chunk
          }
        }
      }
    }
  }
}
