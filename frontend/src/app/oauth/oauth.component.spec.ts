import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { TranslateModule } from '@ngx-translate/core'
import { MatCardModule } from '@angular/material/card'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatFormFieldModule } from '@angular/material/form-field'
import { CookieModule } from 'ngx-cookie'
import { HttpClientModule } from '@angular/common/http'
import { RouterTestingModule } from '@angular/router/testing'

import { OAuthComponent } from './oauth.component'
import { LoginComponent } from '../login/login.component'

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
        CookieModule.forRoot(),
        TranslateModule.forRoot(),
        MatCardModule,
        MatFormFieldModule,
        MatCheckboxModule,
        HttpClientModule
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
