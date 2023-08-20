import { Component, NgZone, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { DomSanitizer } from '@angular/platform-browser'
import { MatDialog } from '@angular/material/dialog'
import { Subscription, combineLatest } from 'rxjs'

import { CodeSnippetComponent, Solved as CodingChallengeDialogResult } from '../code-snippet/code-snippet.component'
import { Config, ConfigurationService } from '../Services/configuration.service'
import { CodeSnippetService } from '../Services/code-snippet.service'
import { ChallengeService } from '../Services/challenge.service'
import { SocketIoService } from '../Services/socket-io.service'

import { DEFAULT_FILTER_SETTING, FilterSetting } from './filter-settings/FilterSetting'
import { EnrichedChallenge } from './types/EnrichedChallenge'

import { fromQueryParams, toQueryParams } from './filter-settings/query-params-converters'
import { filterChallenges } from './helpers/challenge-filtering'
import { sortChallenges } from './helpers/challenge-sorting'

interface ChallengeSolvedWebsocket {
  key: string
  name: string
  challenge: string
  flag: string
  hidden: boolean
  isRestore: boolean
}

@Component({
  selector: 'score-board-preview',
  templateUrl: './score-board-preview.component.html',
  styleUrls: ['./score-board-preview.component.scss']
})
export class ScoreBoardPreviewComponent implements OnInit, OnDestroy {
  public allChallenges: EnrichedChallenge[] = []
  public filteredChallenges: EnrichedChallenge[] = []
  public filterSetting: FilterSetting = structuredClone(DEFAULT_FILTER_SETTING)
  public applicationConfiguration: Config | null = null

  private readonly subscriptions: Subscription[] = []

  constructor (
    private readonly challengeService: ChallengeService,
    private readonly codeSnippetService: CodeSnippetService,
    private readonly configurationService: ConfigurationService,
    private readonly sanitizer: DomSanitizer,
    private readonly ngZone: NgZone,
    private readonly io: SocketIoService,
    private readonly dialog: MatDialog,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) { }

  ngOnInit () {
    console.time('ScoreBoardPreview - load challenges')
    const dataLoaderSubscription = combineLatest([
      this.challengeService.find({ sort: 'name' }),
      this.codeSnippetService.challenges(),
      this.configurationService.getApplicationConfiguration()
    ]).subscribe(([challenges, challengeKeysWithCodeChallenges, applicationConfiguration]) => {
      console.timeEnd('ScoreBoardPreview - load challenges')
      this.applicationConfiguration = applicationConfiguration

      console.time('ScoreBoardPreview - transform challenges')
      const transformedChallenges = challenges.map((challenge) => {
        return {
          ...challenge,
          tagList: challenge.tags ? challenge.tags.split(',').map((tag) => tag.trim()) : [],
          originalDescription: challenge.description as string,
          description: this.sanitizer.bypassSecurityTrustHtml(challenge.description as string),
          difficultyAsList: [...Array(challenge.difficulty).keys()],
          hasCodingChallenge: challengeKeysWithCodeChallenges.includes(challenge.key)
        }
      })
      this.allChallenges = transformedChallenges
      this.filterAndUpdateChallenges()
      console.timeEnd('ScoreBoardPreview - transform challenges')
    })
    this.subscriptions.push(dataLoaderSubscription)

    const routerSubscription = this.route.queryParams.subscribe((queryParams) => {
      this.filterSetting = fromQueryParams(queryParams)
      this.filterAndUpdateChallenges()
    })
    this.subscriptions.push(routerSubscription)

    this.io.socket().on('challenge solved', this.onChallengeSolvedWebsocket.bind(this))
  }

  ngOnDestroy (): void {
    this.io.socket().off('challenge solved', this.onChallengeSolvedWebsocket.bind(this))
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe()
    }
  }

  onFilterSettingUpdate (filterSetting: FilterSetting) {
    this.router.navigate([], {
      queryParams: toQueryParams(filterSetting)
    })
  }

  onChallengeSolvedWebsocket (data?: ChallengeSolvedWebsocket) {
    console.log('ScoreBoardPreview - challenge solved', data)
    if (!data) {
      return
    }

    this.allChallenges = this.allChallenges.map((challenge) => {
      if (challenge.key === data.key) {
        console.log('ScoreBoardPreview - updating challenge', data.key)
        return {
          ...challenge,
          solved: true
        }
      }
      return { ...challenge }
    })
    this.filterAndUpdateChallenges()
    // manually trigger angular change detection... :(
    // unclear why this is necessary, possibly because the socket.io callback is not running inside angular
    this.ngZone.run(() => {})
  }

  filterAndUpdateChallenges (): void {
    this.filteredChallenges = sortChallenges(
      filterChallenges(this.allChallenges, {
        ...this.filterSetting,
        restrictToTutorialChallengesFirst: this.applicationConfiguration?.challenges?.restrictToTutorialsFirst ?? true
      })
    )
  }

  // angular helper to speed up challenge rendering
  getChallengeKey (index: number, challenge: EnrichedChallenge): string {
    return challenge.key
  }

  reset () {
    this.router.navigate([], {
      queryParams: toQueryParams(DEFAULT_FILTER_SETTING)
    })
  }

  openCodingChallengeDialog (challengeKey: string) {
    const challenge = this.allChallenges.find((challenge) => challenge.key === challengeKey)

    const dialogRef = this.dialog.open(CodeSnippetComponent, {
      disableClose: true,
      data: {
        key: challengeKey,
        name: challenge.name,
        codingChallengeStatus: challenge.codingChallengeStatus
      }
    })

    dialogRef.afterClosed().subscribe((result: CodingChallengeDialogResult) => {
      this.allChallenges = this.allChallenges.map((challenge) => {
        if (challenge.codingChallengeStatus < 1) {
          return {
            ...challenge,
            codingChallengeStatus: result.findIt ? 1 : challenge.codingChallengeStatus
          }
        }
        if (challenge.codingChallengeStatus < 2) {
          return {
            ...challenge,
            codingChallengeStatus: result.fixIt ? 2 : challenge.codingChallengeStatus
          }
        }
        return { ...challenge }
      })
      this.filterAndUpdateChallenges()
    })
  }

  async repeatChallengeNotification (challengeKey: string) {
    const challenge = this.allChallenges.find((challenge) => challenge.key === challengeKey)
    await this.challengeService.repeatNotification(encodeURIComponent(challenge.name)).toPromise()
  }
}
