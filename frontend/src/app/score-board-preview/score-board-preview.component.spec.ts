import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { TranslateModule } from "@ngx-translate/core";
import { of } from "rxjs";

import { HackingChallengeProgressScoreCardComponent } from "./components/hacking-challenge-progress-score-card/hacking-challenge-progress-score-card.component";
import { CodingChallengeProgressScoreCardComponent } from "./components/coding-challenge-progress-score-card/coding-challenge-progress-score-card.component";
import { ChallengesUnavailableWarningComponent } from "./components/challenges-unavailable-warning/challenges-unavailable-warning.component";
import { DifficultyOverviewScoreCardComponent } from "./components/difficulty-overview-score-card/difficulty-overview-score-card.component";
import { PreviewFeatureNoticeComponent } from "./components/preview-feature-notice/preview-feature-notice.component";
import { TutorialModeWarningComponent } from "./components/tutorial-mode-warning/tutorial-mode-warning.component";
import { WarningCardComponent } from "./components/warning-card/warning-card.component";
import { ScoreCardComponent } from "./components/score-card/score-card.component";
import { ScoreBoardPreviewComponent } from "./score-board-preview.component";
import { ConfigurationService } from "../Services/configuration.service";
import { CodeSnippetService } from "../Services/code-snippet.service";
import { ChallengeService } from "../Services/challenge.service";
import { Challenge } from "../Models/challenge.model";

function createChallenge({
  name,
  key,
  category,
  difficulty,
  solved,
}: {
  name: string;
  key: string;
  category: string;
  difficulty: 1 | 2 | 3 | 4 | 5 | 6;
  solved: boolean;
}): Challenge {
  return {
    name,
    key,
    category,
    difficulty,
    description: "",
    hint: "",
    tags: "",
    hintUrl: "",
    disabledEnv: null,
    solved,
    tutorialOrder: null,
    hasTutorial: false,
    hasSnippet: false,
    codingChallengeStatus: 0,
    mitigationUrl: "",
  };
}

describe("ScoreBoardPreviewComponent", () => {
  let component: ScoreBoardPreviewComponent;
  let fixture: ComponentFixture<ScoreBoardPreviewComponent>;
  let challengeService;
  let codeSnippetService;
  let configService;

  beforeEach(async () => {
    challengeService = jasmine.createSpyObj("ChallengeService", ["find"]);
    codeSnippetService = jasmine.createSpyObj("CodeSnippetService", [
      "challenges",
    ]);
    configService = jasmine.createSpyObj("ConfigurationService", [
      "getApplicationConfiguration",
    ]);
    await TestBed.configureTestingModule({
      declarations: [
        ScoreBoardPreviewComponent,
        HackingChallengeProgressScoreCardComponent,
        CodingChallengeProgressScoreCardComponent,
        DifficultyOverviewScoreCardComponent,
        WarningCardComponent,
        PreviewFeatureNoticeComponent,
        ChallengesUnavailableWarningComponent,
        TutorialModeWarningComponent,
        ScoreCardComponent,
      ],
      imports: [
        TranslateModule.forRoot(),
        HttpClientTestingModule,
        RouterTestingModule,
        MatDialogModule,
        MatIconModule,
      ],
      providers: [
        { provide: ChallengeService, useValue: challengeService },
        { provide: CodeSnippetService, useValue: codeSnippetService },
        { provide: ConfigurationService, useValue: configService },
      ],
    }).compileComponents();

    challengeService.find.and.returnValue(
      of([
        createChallenge({
          name: "Challenge 1",
          key: "challenge-1",
          category: "category-blue",
          difficulty: 1,
          solved: true,
        }),
        createChallenge({
          name: "Challenge 2",
          key: "challenge-2",
          category: "category-blue",
          difficulty: 5,
          solved: false,
        }),
        createChallenge({
          name: "Challenge 3",
          key: "challenge-3",
          category: "category-red",
          difficulty: 3,
          solved: false,
        }),
      ])
    );
    codeSnippetService.challenges.and.returnValue(of(["challenge-2"]));
    configService.getApplicationConfiguration.and.returnValue(
      of({
        challenges: {
          restrictToTutorialsFirst: false,
          codingChallengesEnabled: true,
          showHints: true,
          showMitigations: true,
        },
      })
    );

    fixture = TestBed.createComponent(ScoreBoardPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should not filter any challenges on default settings", (): void => {
    expect(component.filteredChallenges).toHaveSize(3);
  });

  it("should properly identify that a challenge has a associated coding challenge", (): void => {
    expect(
      component.filteredChallenges.find(
        (challenge) => challenge.key === "challenge-2"
      ).hasCodingChallenge
    ).toBe(true);
  });

  it("should mark challenges as solved on challenge notification webhook", (): void => {
    expect(
      component.filteredChallenges.find(
        (challenge) => challenge.key === "challenge-3"
      ).solved
    ).toBeFalse();

    component.onChallengeSolvedWebsocket({
      key: "challenge-3",
      name: "",
      challenge: "",
      flag: "",
      hidden: false,
      isRestore: false,
    });

    expect(
      component.filteredChallenges.find(
        (challenge) => challenge.key === "challenge-3"
      ).solved
    ).toBeTrue();
  });
});
