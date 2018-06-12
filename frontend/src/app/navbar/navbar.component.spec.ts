import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { UserService } from './../Services/user.service'
import { ConfigurationService } from 'src/app/Services/configuration.service'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { HttpClientModule } from '@angular/common/http'
import { NavbarComponent } from './navbar.component'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatSelectModule } from '@angular/material/select'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatButtonModule } from '@angular/material/button'
import { AdministrationService } from './../Services/administration.service'
import { RouterTestingModule } from '@angular/router/testing'
import { MatMenuModule } from '@angular/material/menu'
import { MatTooltipModule } from '@angular/material/tooltip'

describe('NavbarComponent', () => {
  let component: NavbarComponent
  let fixture: ComponentFixture<NavbarComponent>

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [ NavbarComponent ],
      imports: [
        RouterTestingModule,
        HttpClientModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        MatToolbarModule,
        MatIconModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatMenuModule,
        MatTooltipModule
      ],
      providers: [
        AdministrationService,
        ConfigurationService,
        UserService,
        TranslateService
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
