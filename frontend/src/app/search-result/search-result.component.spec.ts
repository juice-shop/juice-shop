import { HttpClientModule } from '@angular/common/http'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { SearchResultComponent } from './search-result.component'
import { ProductService } from './../Services/product.service'
import { RouterTestingModule } from '@angular/router/testing'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatDialog } from '@angular/material/dialog'

describe('SearchResultComponent', () => {
  let component: SearchResultComponent
  let fixture: ComponentFixture<SearchResultComponent>

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [ SearchResultComponent ],
      imports: [
        RouterTestingModule,
        HttpClientModule,
        BrowserAnimationsModule,
        MatTableModule,
        MatPaginatorModule
      ],
      providers: [
        ProductService,
        MatDialog
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchResultComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
