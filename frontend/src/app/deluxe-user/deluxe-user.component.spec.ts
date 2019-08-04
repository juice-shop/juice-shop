import { TranslateModule } from '@ngx-translate/core'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'
import { MatInputModule } from '@angular/material/input'
import { ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { BarRatingModule } from 'ng2-bar-rating'
import { of, throwError } from 'rxjs'
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

  it('should remove authentication token from localStorage', () => {
    spyOn(localStorage,'removeItem')
    component.logout()
    expect(localStorage.removeItem).toHaveBeenCalledWith('token')
  })

  it('should remove authentication token from cookies', () => {
    component.logout()
    expect(cookieService.remove).toHaveBeenCalledWith('token', { domain: `${document.domain}` })
  })

  it('should remove basket id from session storage', () => {
    spyOn(sessionStorage,'removeItem')
    component.logout()
    expect(sessionStorage.removeItem).toHaveBeenCalledWith('bid')
  })

  it('should set the login status to be false via UserService', () => {
    component.logout()
    expect(userService.isLoggedIn.next).toHaveBeenCalledWith(false)
  })

  it('should save the last login IP address', () => {
    component.logout()
    expect(userService.saveLastLoginIp).toHaveBeenCalled()
  })

  it('should forward to login page', fakeAsync(() => {
    component.logout()
    tick()
    expect(location.path()).toBe('/login')
  }))

  it('should log error from upgrade to deluxe API call directly to browser console', fakeAsync(() => {
    userService.upgradeToDeluxe.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.upgradeToDeluxe()
    fixture.detectChanges()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should log error from get deluxe status API call directly to browser console', fakeAsync(() => {
    userService.deluxeStatus.and.returnValue(throwError({ error: 'error' }))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    fixture.detectChanges()
    expect(console.log).toHaveBeenCalledWith({ error: 'error' })
    expect(component.error).toBe('error')
  }))

  it('should hold address on ngOnInit', () => {
    userService.deluxeStatus.and.returnValue(of({ membershipCost: 30 }))
    component.ngOnInit()
    expect(component.membershipCost).toEqual(30)
  })

  it('should call logout on calling upgradeToDeluxe', () => {
    userService.upgradeToDeluxe.and.returnValue(of([]))
    spyOn(component,'logout')
    component.upgradeToDeluxe()
    expect(component.logout).toHaveBeenCalled()
  })
})
