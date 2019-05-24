import { TranslateModule } from '@ngx-translate/core'
import { MatDividerModule } from '@angular/material/divider'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { AccountingComponent } from './accounting.component'
import { ProductService } from '../Services/product.service'
import { RouterTestingModule } from '@angular/router/testing'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatCardModule } from '@angular/material/card'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule } from '@angular/material/paginator'
import { of } from 'rxjs'
import { DomSanitizer } from '@angular/platform-browser'
import { QuantityService } from '../Services/quantity.service'
import { MatFormFieldModule } from '@angular/material/form-field'

describe('AccountingComponent', () => {
  let component: AccountingComponent
  let fixture: ComponentFixture<AccountingComponent>
  let productService
  let quantityService
  let sanitizer

  beforeEach(async(() => {
    quantityService = jasmine.createSpyObj('QuantityService', ['getAll', 'get', 'put'])
    quantityService.getAll.and.returnValue(of([]))
    quantityService.get.and.returnValue(of({}))
    quantityService.put.and.returnValue(of({}))
    productService = jasmine.createSpyObj('ProductService', ['search', 'get', 'put'])
    productService.search.and.returnValue(of([]))
    productService.get.and.returnValue(of({}))
    productService.put.and.returnValue(of({}))
    sanitizer = jasmine.createSpyObj('DomSanitizer',['bypassSecurityTrustHtml', 'sanitize'])
    sanitizer.bypassSecurityTrustHtml.and.returnValue(of({}))
    sanitizer.sanitize.and.returnValue({})

    TestBed.configureTestingModule({
      declarations: [ AccountingComponent ],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        MatTableModule,
        MatPaginatorModule,
        MatFormFieldModule,
        MatDividerModule,
        MatGridListModule,
        MatCardModule
      ],
      providers: [
        { provide: ProductService, useValue: productService },
        { provide: QuantityService, useValue: quantityService },
        { provide: DomSanitizer, useValue: sanitizer }
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountingComponent)
    component = fixture.componentInstance
    component.ngAfterViewInit()
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
