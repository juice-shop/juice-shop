import { Component, input } from '@angular/core'

@Component({
  selector: 'difficulty-stars',
  templateUrl: './difficulty-stars.component.html',
  styleUrls: ['./difficulty-stars.component.scss'],
  imports: []
})
export class DifficultyStarsComponent {
  readonly difficulty = input.required<1 | 2 | 3 | 4 | 5 | 6>()
}
