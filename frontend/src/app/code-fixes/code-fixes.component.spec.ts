import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { CookieModule, CookieService } from 'ngx-cookie'

import { CodeFixesComponent } from './code-fixes.component'

describe('CodeFixesComponent', () => {
  let component: CodeFixesComponent
  let fixture: ComponentFixture<CodeFixesComponent>
  let cookieService: any

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CookieModule.forRoot()],
      declarations: [CodeFixesComponent],
      providers: [CookieService]
    })
      .compileComponents()
    cookieService = TestBed.inject(CookieService)
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeFixesComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set the format from cookie if the cookie key exists', () => {
    spyOn(cookieService, 'hasKey').and.returnValue(true)
    spyOn(cookieService, 'get').and.returnValue('LineByLine')
    component.ngOnInit()
    expect(component.format).toBe('LineByLine')
  })

  it('should set the format to "LineByLine" and save it in the cookie if the cookie key does not exist', () => {
    spyOn(cookieService, 'hasKey').and.returnValue(false)
    spyOn(cookieService, 'put')
    component.ngOnInit()
    expect(component.format).toBe('LineByLine')
    expect(cookieService.put).toHaveBeenCalledWith('code-fixes-component-format', 'LineByLine')
  })
})
