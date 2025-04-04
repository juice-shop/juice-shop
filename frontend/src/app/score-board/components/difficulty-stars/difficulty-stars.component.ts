import { Component, Input } from '@angular/core'
import { NgFor } from '@angular/common'

@Component({
  selector: 'difficulty-stars',
  templateUrl: './difficulty-stars.component.html',
  styleUrls: ['./difficulty-stars.component.scss'],
  imports: [NgFor]
})
export class DifficultyStarsComponent {
  @Input()
    difficulty: 1 | 2 | 3 | 4 | 5 | 6
}
