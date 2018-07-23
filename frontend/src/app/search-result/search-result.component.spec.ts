import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MatDividerModule } from '@angular/material/divider'
import { HttpClientModule } from '@angular/common/http'
import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing'
import { SearchResultComponent } from './search-result.component'
import { ProductService } from './../Services/product.service'
import { RouterTestingModule } from '@angular/router/testing'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { of } from 'rxjs'
import { DomSanitizer } from '@angular/platform-browser'
import { throwError } from 'rxjs/internal/observable/throwError'
import { ProductDetailsComponent } from 'src/app/product-details/product-details.component'

class MockSocket {
  on (str: string, callback) {
    callback(str)
  }
}

describe('SearchResultComponent', () => {
  let component: SearchResultComponent
  let fixture: ComponentFixture<SearchResultComponent>
  let productService
  let dialog
  let sanitizer
  let mockSocket

  beforeEach(async(() => {

    dialog = jasmine.createSpyObj('MatDialog',['open'])
    dialog.open.and.returnValue(null)
    productService = jasmine.createSpyObj('ProductService', ['search'])
    productService.search.and.returnValue(of([]))
    sanitizer = jasmine.createSpyObj('DomSanitizer',['bypassSecurityTrustHtml', 'sanitize'])
    sanitizer.bypassSecurityTrustHtml.and.returnValue(of({}))
    sanitizer.sanitize.and.returnValue({})
    mockSocket = new MockSocket()

    TestBed.configureTestingModule({
      declarations: [ SearchResultComponent ],
      imports: [
        RouterTestingModule,
        HttpClientModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        MatTableModule,
        MatPaginatorModule,
        MatDialogModule,
        MatDividerModule
      ],
      providers: [
        TranslateService,
        { provide: MatDialog, useValue: dialog },
        { provide: ProductService, useValue: productService },
        { provide: DomSanitizer, useValue: sanitizer }
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchResultComponent)
    component = fixture.componentInstance
    spyOn(component.io,'connect').and.returnValue(mockSocket)
    component.ngAfterViewInit()
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should render product descriptions as trusted HTML', () => {
    productService.search.and.returnValue(of([ { description: '<script>alert("XSS")</script>' } ]))
    component.ngAfterViewInit()
    fixture.detectChanges()
    expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('<script>alert("XSS")</script>')
  })

  it('should hold no products when product search API call fails', () => {
    productService.search.and.returnValue(throwError('Error'))
    component.ngAfterViewInit()
    fixture.detectChanges()
    expect(component.tableData).toEqual([])
  })

  it('should log error from product search API call directly to browser console', fakeAsync(() => {
    productService.search.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngAfterViewInit()
    fixture.detectChanges()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should open a modal dialog with product details', () => {
    component.showDetail(42)
    expect(dialog.open).toHaveBeenCalledWith(ProductDetailsComponent, {
      width: '1000px',
      height: 'max-content',
      data: {
        productData: 42
      }
    })
  })
})
