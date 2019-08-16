import { TranslateModule } from '@ngx-translate/core'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { MatInputModule } from '@angular/material/input'
import { ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { BarRatingModule } from 'ng2-bar-rating'
import { of } from 'rxjs'
import { RouterTestingModule } from '@angular/router/testing'
import { MatTableModule, MatExpansionModule, MatDividerModule, MatRadioModule, MatDialogModule, MatIconModule, MatCheckboxModule, MatTooltipModule } from '@angular/material'
import { DeluxeUserComponent } from './deluxe-user.component'
import { UserService } from '../Services/user.service'
import { CookieService } from 'ngx-cookie'
import { LoginComponent } from '../login/login.component'
import { Location } from '@angular/common'

describe('DeluxeUserComponent', () => {
  let component: DeluxeUserComponent
  let fixture: ComponentFixture<DeluxeUserComponent>
  let userService
  let cookieService: any
  let location: Location

  beforeEach(async(() => {

    userService = jasmine.createSpyObj('UserService',['deluxeStatus', 'upgradeToDeluxe', 'saveLastLoginIp'])
    userService.deluxeStatus.and.returnValue(of({}))
    userService.upgradeToDeluxe.and.returnValue(of({}))
    userService.isLoggedIn = jasmine.createSpyObj('userService.isLoggedIn', ['next'])
    userService.isLoggedIn.next.and.returnValue({})
    userService.saveLastLoginIp.and.returnValue(of({}))
    cookieService = jasmine.createSpyObj('CookieService',['remove'])

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'login', component: LoginComponent }
        ]),
        TranslateModule.forRoot(),
        HttpClientTestingModule,
        ReactiveFormsModule,
        BarRatingModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatExpansionModule,
        MatDividerModule,
        MatRadioModule,
        MatDialogModule,
        MatIconModule,
        MatCheckboxModule,
        MatTooltipModule
      ],
      declarations: [ DeluxeUserComponent, LoginComponent ],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: CookieService, useValue: cookieService }
      ]
    })
    .compileComponents()

    location = TestBed.get(Location)
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DeluxeUserComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should hold membership cost on ngOnInit', () => {
    userService.deluxeStatus.and.returnValue(of({ membershipCost: 30 }))
    component.ngOnInit()
    expect(component.membershipCost).toEqual(30)
  })
})
