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
import { OrderConfirmationComponent } from './order-confirmation.component'
import { TrackOrderService } from '../Services/track-order.service'
import { RouterTestingModule } from '@angular/router/testing'

fdescribe('OrderConfirmationComponent', () => {
  let component: OrderConfirmationComponent
  let fixture: ComponentFixture<OrderConfirmationComponent>
  let trackOrderService

  beforeEach(async(() => {

    trackOrderService = jasmine.createSpyObj('TrackOrderService', ['save'])
    trackOrderService.save.and.returnValue(of({ Products: {} }))

    TestBed.configureTestingModule({
      declarations: [ OrderConfirmationComponent ],
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
    fixture = TestBed.createComponent(OrderConfirmationComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
