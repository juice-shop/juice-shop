import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { TranslateModule } from '@ngx-translate/core'
import { MatIconModule } from '@angular/material/icon'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatCardModule } from '@angular/material/card'
import { MatInputModule } from '@angular/material/input'

import { CookieModule } from 'ngx-cookie'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { RouterTestingModule } from '@angular/router/testing'

import { OAuthComponent } from './oauth.component'
import { LoginComponent } from '../login/login.component'
import { ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { MatTooltipModule } from '@angular/material/tooltip'

describe('OAuthComponent', () => {
  let component: OAuthComponent
  let fixture: ComponentFixture<OAuthComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OAuthComponent, LoginComponent ],
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'login', component: LoginComponent }
        ]
        ),
        ReactiveFormsModule,
        CookieModule.forRoot(),
        TranslateModule.forRoot(),
        MatInputModule,
        MatIconModule ,
        MatCardModule,
        MatFormFieldModule,
        MatCheckboxModule,
        HttpClientTestingModule,
        MatTooltipModule
      ],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { data: { params: '?alt=json&access_token=TEST' } } } }
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(OAuthComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
