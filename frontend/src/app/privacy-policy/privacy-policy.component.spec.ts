import { HttpClientTestingModule } from '@angular/common/http/testing'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { ConfigurationService } from '../Services/configuration.service'

import { PrivacyPolicyComponent } from './privacy-policy.component'
import { of } from 'rxjs'

describe('PrivacyPolicyComponent', () => {
  let component: PrivacyPolicyComponent
  let fixture: ComponentFixture<PrivacyPolicyComponent>
  let configurationService

  beforeEach(async(() => {
    configurationService = jasmine.createSpyObj('ConfigurationService',['getApplicationConfiguration'])
    configurationService.getApplicationConfiguration.and.returnValue(of({}))

    TestBed.configureTestingModule({
      declarations: [PrivacyPolicyComponent],
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        { provide: ConfigurationService, useValue: configurationService }
      ]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivacyPolicyComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should compile', () => {
    expect(component).toBeTruthy()
  })
})
