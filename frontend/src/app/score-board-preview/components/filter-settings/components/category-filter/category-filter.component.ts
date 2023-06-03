import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core'
import { EnrichedChallenge } from '../../../../types/EnrichedChallenge'
import { uniq } from 'lodash'

@Component({
  selector: 'category-filter',
  templateUrl: './category-filter.component.html',
  styleUrls: ['./category-filter.component.scss']
})
export class CategoryFilterComponent implements OnInit, OnChanges {
  public availableCategories = []

  @Input()
  readonly allChallenges: EnrichedChallenge[]

  @Input()
  categories: Set<string>

  @Output()
  categoriesChange = new EventEmitter<Set<string>>()

  ngOnInit () {
    this.availableCategories = uniq(this.allChallenges.map((challenge) => challenge.category))
  }

  ngOnChanges () {
    this.availableCategories = uniq(this.allChallenges.map((challenge) => challenge.category))
  }

  public resetCategoryFilter () {
    this.categories = new Set()
    this.categoriesChange.emit(this.categories)
  }

  public toggleCategorySelected (category: string) {
    if (this.categories.has(category)) {
      this.categories.delete(category)
    } else {
      this.categories.add(category)
    }
    this.categoriesChange.emit(this.categories)
  }

  public isAllCategoriesSelected () {
    return (this.categories.size === 0)
  }

  public isCategorySelected (category: string) {
    return this.categories.has(category)
  }
}
