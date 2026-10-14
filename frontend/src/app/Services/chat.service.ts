/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Injectable, inject } from '@angular/core'
import { HttpClient, type HttpDownloadProgressEvent, HttpEventType } from '@angular/common/http'
import { environment } from '../../environments/environment'

export interface ChatChunk {
  deltaContent?: string
  deltaToolCalls?: ToolCall[]
  finishReason?: string | null
  error?: string
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
  private readonly http = inject(HttpClient)
  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/rest/chat'

  async * streamMessages (messages: { role: string, content: string }[]): AsyncGenerator<ChatChunk> {
    const chunks: ChatChunk[] = []
    let resolve: (() => void) | null = null
    let done = false
    let processedLength = 0

    this.http.post(this.host, { messages }, {
      responseType: 'text',
      observe: 'events',
      reportProgress: true
    }).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.DownloadProgress) {
          const text = (event as HttpDownloadProgressEvent).partialText ?? ''
          const newText = text.slice(processedLength)
          processedLength = text.length

          const lines = newText.split('\n')
          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || !trimmed.startsWith('data: ')) continue
            const data = trimmed.slice(6)
            if (data === '[DONE]') {
              done = true
              resolve?.()
              return
            }

            const parsed = JSON.parse(data)

            if (parsed.error) {
              chunks.push({ error: parsed.error })
              done = true
              resolve?.()
              return
            }

            const delta = parsed.choices?.[0]?.delta
            const finishReason = parsed.choices?.[0]?.finish_reason

            if (delta) {
              const chunk: ChatChunk = {}
              if (delta.content) chunk.deltaContent = delta.content
              if (delta.tool_calls) chunk.deltaToolCalls = delta.tool_calls
              if (finishReason) chunk.finishReason = finishReason
              if (chunk.deltaContent || chunk.deltaToolCalls || chunk.finishReason) {
                chunks.push(chunk)
              }
            }
          }
          resolve?.()
        }
      },
      error: () => {
        chunks.push({ error: 'connection_failed' })
        done = true
        resolve?.()
      },
      complete: () => {
        done = true
        resolve?.()
      }
    })

    let yielded = 0
    while (!done || yielded < chunks.length) {
      if (yielded < chunks.length) {
        yield chunks[yielded++]
      } else {
        await new Promise<void>((r) => { resolve = r })
      }
    }
  }
}
