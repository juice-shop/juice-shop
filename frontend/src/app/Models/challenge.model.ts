import { SafeHtml } from '@angular/platform-browser'

export interface Challenge {
  name: string,
  category: string,
  description?: string | SafeHtml,
  difficulty: number,
  hint?: string,
  hintUrl?: string,
  disabledEnv?: string[],
  solved?: boolean,
  hasTutorial?: boolean
}
