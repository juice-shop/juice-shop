import { type ComponentFixture, TestBed } from '@angular/core/testing'

import { ScoreCardComponent } from './score-card.component'

describe('ScoreCardComponent', () => {
    let component: ScoreCardComponent
    let fixture: ComponentFixture<ScoreCardComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ScoreCardComponent]
        })
            .compileComponents()

        fixture = TestBed.createComponent(ScoreCardComponent)
        component = fixture.componentInstance

        fixture.componentRef.setInput('description', 'Test')
        fixture.componentRef.setInput('total', 10)
        fixture.componentRef.setInput('score', 5)
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
