import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core'

@Component({
  selector: 'difficulty-stars',
  templateUrl: './difficulty-stars.component.html',
  styleUrls: ['./difficulty-stars.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: []
})
export class DifficultyStarsComponent {

  readonly difficulty = input.required<1 | 2 | 3 | 4 | 5 | 6>()
  // only filled stars shown per difficulty level
  readonly stars = computed(() => Array.from({ length: this.difficulty() }, (_, i) => i + 1))
  readonly ariaLabel = computed(() => `Difficulty ${this.difficulty()} of 6`)

}
