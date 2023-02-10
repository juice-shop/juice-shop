import { ComponentFixture, TestBed } from '@angular/core/testing'
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

  it('should remember the original order of available code fix options when shuffling', () => {
    component.fixes = ['Fix 1', 'Fix 2', 'Fix 3']
    component.shuffle()
    expect(component.randomFixes).toContain({ fix: 'Fix 1', index: 0 })
    expect(component.randomFixes).toContain({ fix: 'Fix 2', index: 1 })
    expect(component.randomFixes).toContain({ fix: 'Fix 3', index: 2 })
  })
})
