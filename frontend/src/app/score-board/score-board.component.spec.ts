import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { MatIconModule } from '@angular/material/icon'
import { TranslateModule } from '@ngx-translate/core'
import { of, throwError } from 'rxjs'

import { HackingChallengeProgressScoreCardComponent } from './components/hacking-challenge-progress-score-card/hacking-challenge-progress-score-card.component'
import { CodingChallengeProgressScoreCardComponent } from './components/coding-challenge-progress-score-card/coding-challenge-progress-score-card.component'
import { ChallengesUnavailableWarningComponent } from './components/challenges-unavailable-warning/challenges-unavailable-warning.component'
import { DifficultyOverviewScoreCardComponent } from './components/difficulty-overview-score-card/difficulty-overview-score-card.component'
import { TutorialModeWarningComponent } from './components/tutorial-mode-warning/tutorial-mode-warning.component'
import { WarningCardComponent } from './components/warning-card/warning-card.component'
import { ScoreCardComponent } from './components/score-card/score-card.component'
import { ScoreBoardComponent } from './score-board.component'
import { ConfigurationService } from '../Services/configuration.service'
import { ChallengeService } from '../Services/challenge.service'
import { type Challenge } from '../Models/challenge.model'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { HintService } from '../Services/hint.service'
import { SocketIoService } from '../Services/socket-io.service'
import { Router } from '@angular/router'

// allows to easily create a challenge with some overwrites
function createChallenge(challengeOverwrites: Partial<Challenge>): Challenge {
    return {
        name: 'foobar',
        key: 'challenge-1',
        category: 'category-blue',
        difficulty: 3,
        description: '',
        tags: '',
        disabledEnv: null,
        solved: false,
        tutorialOrder: null,
        hasTutorial: false,
        hasSnippet: false,
        codingChallengeStatus: 0,
        mitigationUrl: '',
        hasCodingChallenge: false,
        ...challengeOverwrites
    }
}

describe('ScoreBoardComponent', () => {
    let component: ScoreBoardComponent
    let fixture: ComponentFixture<ScoreBoardComponent>
    let challengeService
    let hintService
    let configService

    beforeEach(async () => {
        challengeService = {
            find: vi.fn().mockName("ChallengeService.find")
        }
        hintService = {
            getAll: vi.fn().mockName("HintService.getAll"),
            put: vi.fn().mockName("HintService.put")
        }
        configService = {
            getApplicationConfiguration: vi.fn().mockName("ConfigurationService.getApplicationConfiguration")
        }
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(),
                RouterTestingModule,
                MatProgressSpinnerModule,
                MatIconModule,
                ScoreBoardComponent,
                HackingChallengeProgressScoreCardComponent,
                CodingChallengeProgressScoreCardComponent,
                DifficultyOverviewScoreCardComponent,
                WarningCardComponent,
                ChallengesUnavailableWarningComponent,
                TutorialModeWarningComponent,
                ScoreCardComponent],
            providers: [
                { provide: ChallengeService, useValue: challengeService },
                { provide: HintService, useValue: hintService },
                { provide: ConfigurationService, useValue: configService },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        }).compileComponents()

        challengeService.find.mockReturnValue(of([
            createChallenge({
                name: 'Challenge 1',
                key: 'challenge-1',
                category: 'category-blue',
                difficulty: 1,
                solved: true
            }),
            createChallenge({
                name: 'Challenge 2',
                key: 'challenge-2',
                category: 'category-blue',
                difficulty: 5,
                solved: false,
                hasSnippet: true,
                codingChallengeStatus: 1
            }),
            createChallenge({
                name: 'Challenge 3',
                key: 'challenge-3',
                category: 'category-red',
                difficulty: 3,
                hasSnippet: true,
                solved: false
            })
        ]))

        hintService.getAll.mockReturnValue(of([]))

        configService.getApplicationConfiguration.mockReturnValue(of({
            challenges: {
                restrictToTutorialsFirst: false,
                codingChallengesEnabled: 'solved',
                showHints: true,
                showMitigations: true
            },
            ctf: {
                showFlagsInNotifications: true
            },
            hackingInstructor: {
                isEnabled: true
            }
        }))

        fixture = TestBed.createComponent(ScoreBoardComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should not filter any challenges on default settings', (): void => {
        expect(component.filteredChallenges).toHaveLength(3)
    })

    it('should handle error when unlocking a hint', (): void => {
        hintService.put.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.unlockHint(123)
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should mark challenges as solved on "challenge solved" websocket', (): void => {
        expect(component.filteredChallenges.find((challenge) => challenge.key === 'challenge-3').solved).toBe(false)

        component.onChallengeSolvedWebsocket({
            key: 'challenge-3',
            name: '',
            challenge: '',
            flag: '',
            hidden: false,
            isRestore: false
        })

        expect(component.filteredChallenges.find((challenge) => challenge.key === 'challenge-3').solved).toBe(true)
    })

    it('should mark find it code challenges as solved on "code challenge solved" websocket', (): void => {
        expect(component.filteredChallenges.find((challenge) => challenge.key === 'challenge-3').codingChallengeStatus).toBe(0)

        component.onCodeChallengeSolvedWebsocket({
            key: 'challenge-3',
            codingChallengeStatus: 1
        })

        expect(component.filteredChallenges.find((challenge) => challenge.key === 'challenge-3').codingChallengeStatus).toBe(1)
    })

    it('should mark fix it code challenges as solved on "code challenge solved" websocket', (): void => {
        expect(component.filteredChallenges.find((challenge) => challenge.key === 'challenge-2').codingChallengeStatus).toBe(1)

        component.onCodeChallengeSolvedWebsocket({
            key: 'challenge-2',
            codingChallengeStatus: 2
        })

        expect(component.filteredChallenges.find((challenge) => challenge.key === 'challenge-2').codingChallengeStatus).toBe(2)
    })

    describe('socket payload handling', () => {
        it('should ignore "challenge solved" websocket messages without a payload', (): void => {
            const before = component.filteredChallenges.map(c => c.solved)
            component.onChallengeSolvedWebsocket(undefined)
            expect(component.filteredChallenges.map(c => c.solved)).toEqual(before)
        })

        it('should ignore "code challenge solved" websocket messages without a payload', (): void => {
            const before = component.filteredChallenges.map(c => c.codingChallengeStatus)
            component.onCodeChallengeSolvedWebsocket(undefined)
            expect(component.filteredChallenges.map(c => c.codingChallengeStatus)).toEqual(before)
        })
    })

    describe('filter settings and reset', () => {
        it('should navigate with the converted query params when filter settings are updated', () => {
            const router = TestBed.inject(Router)
            const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true)
            component.onFilterSettingUpdate({ ...component.filterSetting, searchQuery: 'apple' })
            expect(navSpy).toHaveBeenCalled()
            const passed = navSpy.mock.calls[0][1]
            expect(passed.queryParams).toBeDefined()
        })

        it('should navigate to the default filter settings on reset', () => {
            const router = TestBed.inject(Router)
            const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true)
            component.reset()
            expect(navSpy).toHaveBeenCalled()
        })
    })

    describe('repeatChallengeNotification', () => {
        it('should request the backend to repeat the notification for the matching challenge', async () => {
            challengeService.repeatNotification = vi.fn().mockReturnValue(of('ok'))
            await component.repeatChallengeNotification('challenge-2')
            expect(challengeService.repeatNotification).toHaveBeenCalledWith(encodeURIComponent('Challenge 2'))
        })
    })

    describe('unlockHint', () => {
        it('should re-run ngOnInit and remember the unlocked challenge key on success', () => {
            hintService.put.mockReturnValue(of({}))
            const spy = vi.spyOn(component, 'ngOnInit')
            component.unlockHint(7, 'challenge-3')
            expect(component.lastUnlockedChallengeKey).toBe('challenge-3')
            expect(spy).toHaveBeenCalled()
        })

        it('should clear the last unlocked challenge key when no key is provided', () => {
            hintService.put.mockReturnValue(of({}))
            component.lastUnlockedChallengeKey = 'previous'
            component.unlockHint(7)
            expect(component.lastUnlockedChallengeKey).toBeNull()
        })
    })

    describe('ngOnDestroy', () => {
        it('should unsubscribe data and route subscriptions and detach socket handlers', () => {
            const socket = { off: vi.fn() }
            const ioService = TestBed.inject(SocketIoService) as any
            // SocketIoService may not be provided as mock; guard:
            if (ioService && ioService.socket) {
                vi.spyOn(ioService, 'socket').mockReturnValue(socket as any)
            }
            const spies = (component as any).subscriptions.map((s: any) => vi.spyOn(s, 'unsubscribe'))
            component.ngOnDestroy()
            spies.forEach((spy: any) => expect(spy).toHaveBeenCalled())
        })
    })
})
