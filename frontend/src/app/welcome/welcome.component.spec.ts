import { TranslateModule } from '@ngx-translate/core'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MatSnackBar } from '@angular/material'

import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { WelcomeComponent } from './welcome.component'

describe('WelcomeComponent', () => {
  let component: WelcomeComponent
  let fixture: ComponentFixture<WelcomeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        HttpClientTestingModule
      ],
      declarations: [WelcomeComponent],
      providers: [
          { provide: MatSnackBar, useValue: {} }
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
