import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing'

import { TokenSaleComponent } from './token-sale.component'
import { of, throwError } from 'rxjs'
import { ConfigurationService } from './../Services/configuration.service'

describe('TokenSaleComponent', () => {
  let component: TokenSaleComponent
  let fixture: ComponentFixture<TokenSaleComponent>
  let configurationService

  beforeEach(async(() => {

    configurationService = jasmine.createSpyObj('ConfigurationService', ['getApplicationConfiguration'])
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { } }))
    TestBed.configureTestingModule({
      declarations: [ TokenSaleComponent ],
      providers: [
        { provide: ConfigurationService, useValue: configurationService }
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenSaleComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set altcoinName as obtained from configuration', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { altcoinName: 'Coin' } }))
    component.ngOnInit()
    expect(component.altcoinName).toBe('Coin')
  })

  it('should log error on failure in retrieving configuration from backend', fakeAsync(() => {
    configurationService.getApplicationConfiguration.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))
})
