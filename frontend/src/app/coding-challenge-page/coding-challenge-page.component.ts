/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, type OnInit, type ElementRef, inject, viewChild } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinner } from '@angular/material/progress-spinner'
import { TranslateModule } from '@ngx-translate/core'
import { forkJoin, of } from 'rxjs'
import { catchError } from 'rxjs/operators'

import { CodeSnippetService, type CodeSnippet } from '../Services/code-snippet.service'
import { CodeFixesService } from '../Services/code-fixes.service'
import { ChallengeService } from '../Services/challenge.service'
import { CodingChallengeFindItComponent } from '../coding-challenge-find-it/coding-challenge-find-it.component'
import { CodingChallengeFixItComponent } from '../coding-challenge-fix-it/coding-challenge-fix-it.component'

@Component({
  selector: 'coding-challenge-page',
  templateUrl: './coding-challenge-page.component.html',
  styleUrls: ['./coding-challenge-page.component.scss'],
  imports: [MatButtonModule, MatIconModule, MatProgressSpinner, TranslateModule, CodingChallengeFindItComponent, CodingChallengeFixItComponent]
})
export class CodingChallengePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly codeSnippetService = inject(CodeSnippetService)
  private readonly codeFixesService = inject(CodeFixesService)
  private readonly challengeService = inject(ChallengeService)

  readonly fixItSection = viewChild<ElementRef>('fixItSection')

  public challengeKey: string
  public challengeName: string
  public snippet: CodeSnippet = null
  public fixes: string[] = null
  public findItSolved = false
  public fixItSolved = false
  public isLoaded = false

  ngOnInit (): void {
    this.challengeKey = this.route.snapshot.params['challengeKey']

    forkJoin({
      challenges: this.challengeService.find({ sort: 'name' }),
      snippet: this.codeSnippetService.get(this.challengeKey).pipe(
        catchError((err) => of({ snippet: err.error } as CodeSnippet))
      ),
      fixes: this.codeFixesService.get(this.challengeKey).pipe(
        catchError(() => of(null))
      )
    }).subscribe(({ challenges, snippet, fixes }) => {
      const challenge = challenges.find(c => c.key === this.challengeKey)
      if (challenge) {
        this.challengeName = challenge.name
        this.findItSolved = challenge.codingChallengeStatus >= 1
        this.fixItSolved = challenge.codingChallengeStatus >= 2
      }
      this.snippet = snippet
      this.fixes = fixes?.fixes ?? null
      this.isLoaded = true
    })
  }

  onFindItSolved (): void {
    this.findItSolved = true
    if (this.fixes !== null) {
      setTimeout(() => {
        this.fixItSection()?.nativeElement?.scrollIntoView({ behavior: 'smooth' })
      }, 300)
    }
  }

  onFixItSolved (): void {
    this.fixItSolved = true
  }

  goBack (): void {
    this.router.navigate(['/score-board'])
  }
}
