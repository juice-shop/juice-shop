import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { SlideshowModule } from 'ng-simple-slideshow'
import { HttpClientTestingModule } from '@angular/common/http/testing'

import { AboutComponent } from './about.component'

describe('AboutComponent', () => {
  let component: AboutComponent
  let fixture: ComponentFixture<AboutComponent>
  let slideshowModule

  beforeEach(async(() => {

    slideshowModule = jasmine.createSpyObj('SlideshowModule', ['height', 'autoPlay', 'showArrows', 'showDots', 'imageUrls'])

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        SlideshowModule
      ],
      declarations: [ AboutComponent ],
      providers: [
        { provide: SlideshowModule, useValue: slideshowModule }
      ]
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
