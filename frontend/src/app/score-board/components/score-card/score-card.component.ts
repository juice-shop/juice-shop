import { Component, input, ChangeDetectionStrategy } from '@angular/core'
import { DecimalPipe } from '@angular/common'

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'score-card',
  templateUrl: './score-card.component.html',
  styleUrls: ['./score-card.component.scss'],
  imports: [DecimalPipe]
})
export class ScoreCardComponent {
  readonly description = input.required<string>()
  readonly total = input.required<number>()
  readonly score = input.required<number>()

  readonly showAsPercentage = input<boolean>(true)
  readonly showProgressBar = input<boolean>(true)
}
