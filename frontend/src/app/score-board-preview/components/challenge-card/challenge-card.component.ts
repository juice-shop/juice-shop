import { Component, Input } from '@angular/core';

import { EnrichedChallenge } from '../../types/EnrichedChallenge';


@Component({
  selector: 'challenge-card',
  templateUrl: './challenge-card.component.html',
  styleUrls: ['./challenge-card.component.scss']
})
export class ChallengeCardComponent {

  @Input() 
  public challenge: EnrichedChallenge;

}
