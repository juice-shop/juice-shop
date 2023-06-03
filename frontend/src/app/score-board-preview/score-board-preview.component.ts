import { Component, OnInit } from '@angular/core'
import { ChallengeService } from '../Services/challenge.service'
import { CodeSnippetService } from '../Services/code-snippet.service'
import { DomSanitizer } from '@angular/platform-browser'
import { combineLatest, forkJoin } from 'rxjs'
import { EnrichedChallenge } from './types/EnrichedChallenge'
import { uniq } from 'lodash'
import { ActivatedRoute } from '@angular/router'


@Component({
  selector: 'score-board-preview',
  templateUrl: './score-board-preview.component.html',
  styleUrls: ['./score-board-preview.component.scss']
})
export class ScoreBoardPreviewComponent implements OnInit {
  public allChallenges: EnrichedChallenge[] = []
  public filteredChallenges: EnrichedChallenge[] = []

  public categories = [];
  public selectedCategory = new Set();

  constructor (
    private readonly challengeService: ChallengeService,
    private readonly codeSnippetService: CodeSnippetService,
    private readonly sanitizer: DomSanitizer,
    private readonly route: ActivatedRoute
  ) { }


  public toggleCategorySelected (category: string) {
    if (this.selectedCategory.has(category)) {
      this.selectedCategory.delete(category)
    } else {
      this.selectedCategory.add(category)
    }
    this.filteredChallenges = this.filterChallenges(this.allChallenges)
  }
  public isAllCategoriesSelected () {
    return (this.selectedCategory.size === 0)
  }
  public isCategorySelected (category: string) {
    return this.selectedCategory.has(category)
  }

  public resetCategoryFilter () {
    this.selectedCategory = new Set()
    this.filteredChallenges = this.filterChallenges(this.allChallenges)
  }

  public filterChallenges (challenges: EnrichedChallenge[]): EnrichedChallenge[] {
    return challenges.filter((challenge) => {
      if (this.selectedCategory.size === 0) {
        return true
      }
      return this.selectedCategory.has(challenge.category)
    })
  }

  ngOnInit () {
    console.time('ScoreBoardPreview - load challenges')
    combineLatest([
      this.challengeService.find({ sort: 'name' }),
      this.codeSnippetService.challenges(),
      this.route.queryParams
    ]).subscribe(([challenges, challengeKeysWithCodeChallenges, queryParams]) => {
      console.timeEnd('ScoreBoardPreview - load challenges')

      console.time('ScoreBoardPreview - transform challenges')
      const transformedChallenges = challenges.map((challenge) => {
        return {
          ...challenge,
          tagList: challenge.tags ? challenge.tags.split(',').map((tag) => tag.trim()) : [],
          description: this.sanitizer.bypassSecurityTrustHtml(challenge.description as string),
          difficultyAsList: [...Array(challenge.difficulty).keys()],
          hasCodingChallenge: challengeKeysWithCodeChallenges.includes(challenge.key)
        }
      })
      this.allChallenges = transformedChallenges
      this.categories = uniq(transformedChallenges.map((challenge) => challenge.category))
      this.filteredChallenges = this.filterChallenges(this.allChallenges)
      console.timeEnd('ScoreBoardPreview - transform challenges')
    })
  }
  
  getChallengeKey(index: number, challenge: EnrichedChallenge): string {
    return challenge.key
  }
}
