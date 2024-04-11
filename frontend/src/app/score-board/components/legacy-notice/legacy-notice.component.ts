import { Component, Input } from '@angular/core'

import { type Config } from 'src/app/Services/configuration.service'

@Component({
  selector: 'legacy-notice',
  templateUrl: './legacy-notice.component.html'
})
export class LegacyNoticeComponent {
  @Input()
  public applicationConfig: Config | null = null
}
