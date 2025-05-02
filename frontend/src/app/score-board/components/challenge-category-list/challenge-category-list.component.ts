import { Component, Input } from '@angular/core'
import { NgFor } from '@angular/common'

export interface ChallengeCategorySummary {
  name: string
  solved: number
  total: number
}

@Component({
  selector: 'challenge-category-list',
  templateUrl: './challenge-category-list.component.html',
  styleUrls: ['./challenge-category-list.component.scss'],
  imports: [NgFor]
})
export class ChallengeCategorySummaryComponent {
  @Input()
  public challengeCategories: ChallengeCategorySummary[] = []
}
