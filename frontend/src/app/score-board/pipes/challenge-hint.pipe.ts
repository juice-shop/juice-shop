import { TranslateService } from '@ngx-translate/core'
import { Pipe, type PipeTransform } from '@angular/core'
import { type Observable, of } from 'rxjs'
import { map } from 'rxjs/operators'

interface ChallengeHintPipeArgs {
  hintUrl: string | null
}

@Pipe({ name: 'challengeHint', pure: false })
export class ChallengeHintPipe implements PipeTransform {
  constructor (private readonly translate: TranslateService) { }

  transform (hint: string, args: ChallengeHintPipeArgs = { hintUrl: null }): Observable<string> {
    if (args.hintUrl) {
      return this.translate.get('CLICK_FOR_MORE_HINTS').pipe(map((translation) => `${hint} ${translation as string}`))
    }
    return of(hint)
  }
}
