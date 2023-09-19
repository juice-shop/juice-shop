import { Component, Input } from '@angular/core'

import { type Config } from 'src/app/Services/configuration.service'

@Component({
  selector: 'preview-feature-notice',
  templateUrl: './preview-feature-notice.component.html'
})
export class PreviewFeatureNoticeComponent {
  @Input()
  public applicationConfig: Config | null = null
}
