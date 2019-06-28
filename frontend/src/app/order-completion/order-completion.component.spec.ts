import { TranslateModule } from '@ngx-translate/core'
import { MatInputModule } from '@angular/material/input'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { MatCardModule } from '@angular/material/card'
import { MatTableModule } from '@angular/material/table'
import { MatButtonModule } from '@angular/material/button'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { ReactiveFormsModule } from '@angular/forms'
import { of } from 'rxjs'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { TrackOrderService } from '../Services/track-order.service'
import { RouterTestingModule } from '@angular/router/testing'
import { OrderCompletionComponent } from './order-completion.component'

describe('OrderCompletionComponent', () => {
  let component: OrderCompletionComponent
  let fixture: ComponentFixture<OrderCompletionComponent>
  let trackOrderService

  beforeEach(async(() => {

    trackOrderService = jasmine.createSpyObj('TrackOrderService', ['save'])
    trackOrderService.save.and.returnValue(of({ Products: {} }))

    TestBed.configureTestingModule({
      declarations: [ OrderCompletionComponent ],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatCardModule,
        MatTableModule,
        MatButtonModule,
        MatButtonToggleModule
      ],
      providers: [
        { provide: trackOrderService, useValue: TrackOrderService }
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderCompletionComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
