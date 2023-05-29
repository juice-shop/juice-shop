import { Component, OnInit } from '@angular/core';
import { ChallengeService } from '../Services/challenge.service';
import { CodeSnippetService } from '../Services/code-snippet.service';
import { DomSanitizer } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';
import { EnrichedChallenge } from './types/EnrichedChallenge';


@Component({
  selector: 'score-board-preview',
  templateUrl: './score-board-preview.component.html',
  styleUrls: ['./score-board-preview.component.scss']
})
export class ScoreBoardPreviewComponent implements OnInit {
  public allChallenges: EnrichedChallenge[] = [] ;
  public filteredChallenges: EnrichedChallenge[] = [];

  constructor(
    private challengeService: ChallengeService,
    private readonly codeSnippetService: CodeSnippetService,
    private readonly sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    forkJoin([
      this.challengeService.find({ sort: 'name' }),
      this.codeSnippetService.challenges()
    ]).subscribe(([challenges, challengeKeysWithCodeChallenges]) => {

      const transformedChallenges = challenges.map((challenge) => {
        return {
          ...challenge,
          tagList: challenge.tags ? challenge.tags.split(',').map((tag) => tag.trim()) : [],
          description: this.sanitizer.bypassSecurityTrustHtml(challenge.description as string),
          difficultyAsList: [...Array(challenge.difficulty).keys()],
          hasCodingChallenge: challengeKeysWithCodeChallenges.includes(challenge.key)
        }
      });
      this.allChallenges = transformedChallenges;
      this.filteredChallenges = transformedChallenges;
    });
  }
}
