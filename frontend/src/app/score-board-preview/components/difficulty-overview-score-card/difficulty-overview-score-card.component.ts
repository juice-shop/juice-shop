import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { EnrichedChallenge } from '../../types/EnrichedChallenge';

@Component({
  selector: 'difficulty-overview-score-card',
  templateUrl: './difficulty-overview-score-card.component.html',
  styleUrls: ['./difficulty-overview-score-card.component.scss']
})
export class DifficultyOverviewScoreCardComponent implements OnInit, OnChanges {
  @Input()
  public allChallenges: EnrichedChallenge[] = [];

  public availableCodingChallenges: number;
  public solvedCodingChallenges: number;

  ngOnInit(): void {
    this.updatedNumberOfSolvedChallenges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updatedNumberOfSolvedChallenges();
  }
  
  private updatedNumberOfSolvedChallenges(): void {
    const availableCodingChallenges = this.allChallenges
    .filter((challenge) => challenge.hasCodingChallenge);
    
    this.solvedCodingChallenges = availableCodingChallenges
    .map((challenge) => challenge.codingChallengeStatus)
    .reduce((a,b) => a + b, 0); // sum up the scores
    // multiply by 2 because each coding challenge has 2 parts (find it and fix it)
    this.availableCodingChallenges = availableCodingChallenges.length * 2;
  }
}
