import { Component, OnInit } from '@angular/core';
import { ChallengeService } from '../Services/challenge.service';
import { DomSanitizer } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';
import { CodeSnippetService } from '../Services/code-snippet.service';
import { Challenge } from '../Models/challenge.model';

interface EnrichedChallenge extends Challenge {
  tagList: string[];
  difficultyAsList: number[];
  hasCodingChallenge: boolean;
}

@Component({
  selector: 'app-score-board-two',
  templateUrl: './score-board-two.component.html',
  styleUrls: ['./score-board-two.component.scss']
})
export class ScoreBoardTwoComponent implements OnInit {

  public allChallenges: EnrichedChallenge[] = [] ;
  public filteredChallenges: EnrichedChallenge[] = [];


  public solvedHackingChallengesPercentage = 0;
  public solvedCodingChallengesPercentage = 0;

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

      const solvedChallenges = transformedChallenges.filter((challenge) => challenge.solved);
      this.solvedHackingChallengesPercentage = Math.round(solvedChallenges.length / transformedChallenges.length * 100);

      const availableCodingChallenges = transformedChallenges.filter((challenge) => challenge.hasCodingChallenge);

      const solvedCodingScore = availableCodingChallenges.map((challenge) => challenge.codingChallengeStatus).reduce((a,b) => a + b, 0);

      // availableCodingChallenges.length is multiplied by 2 because each coding challenge has 2 parts
      this.solvedCodingChallengesPercentage = Math.round(solvedCodingScore / (availableCodingChallenges.length * 2) * 100);

      this.allChallenges = transformedChallenges;
      this.filteredChallenges = transformedChallenges;
    });
  }
}
