import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { SlideshowModule } from 'ng-simple-slideshow'
import { HttpClientTestingModule } from '@angular/common/http/testing'

import { AboutComponent } from './about.component'

xdescribe('AboutComponent', () => { // FIXME https://github.com/dockleryxk/ng-simple-slideshow/issues/70
  let component: AboutComponent
  let fixture: ComponentFixture<AboutComponent>

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        SlideshowModule
      ],
      declarations: [ AboutComponent ]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
