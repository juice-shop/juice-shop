import { CommonModule } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { environment } from '../../environments/environment'

interface AssistantMessage {
  role: 'user' | 'assistant'
  content: string
}

@Component({
  selector: 'app-assistant-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assistant-widget.component.html',
  styleUrls: ['./assistant-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssistantWidgetComponent {
  private readonly http = inject(HttpClient)

  readonly isOpen = signal(false)
  readonly isLoading = signal(false)
  readonly messages = signal<AssistantMessage[]>([
    {
      role: 'assistant',
      content: 'Hi! Ask me about products or pricing in Juice Shop.'
    }
  ])

  question = ''

  toggleWidget (): void {
    this.isOpen.update(value => !value)
  }

  sendMessage (): void {
    const trimmed = this.question.trim()
    if (!trimmed || this.isLoading()) {
      return
    }

    this.messages.update(messages => [...messages, { role: 'user', content: trimmed }])
    this.question = ''
    this.isLoading.set(true)

    this.http.post<{ answer: string, source: string }>(environment.assistantApiUrl, { question: trimmed }).subscribe({
      next: response => {
        this.messages.update(messages => [...messages, { role: 'assistant', content: response.answer }])
        this.isLoading.set(false)
      },
      error: () => {
        this.messages.update(messages => [...messages, { role: 'assistant', content: 'Sorry, I could not reach the assistant service right now.' }])
        this.isLoading.set(false)
      }
    })
  }
}
