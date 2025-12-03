import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core'

@Component({
  selector: 'difficulty-stars',
  templateUrl: './difficulty-stars.component.html',
  styleUrls: ['./difficulty-stars.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: []
})
export class DifficultyStarsComponent {
  // difficulty value between 0 and maxDifficulty
  readonly difficulty = input.required<number>()
  readonly maxDifficulty = input(6)

  readonly stars = computed(() => Array.from({ length: this.maxDifficulty() }, (_, i) => i + 1))

  readonly ariaLabel = computed(() => `Difficulty ${this.difficulty()} of ${this.maxDifficulty()}`)
}
