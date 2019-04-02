import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { DataExportComponent } from './data-export.component'
import { TranslateService, TranslateModule } from '@ngx-translate/core'
import { ImageCaptchaService } from '../Services/image-captcha.service'
import { MatFormFieldModule, MatInputModule, MatCardModule, MatButtonModule } from '@angular/material'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { ReactiveFormsModule } from '@angular/forms'

describe('DataExportComponent', () => {
  let component: DataExportComponent
  let fixture: ComponentFixture<DataExportComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DataExportComponent],
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        MatFormFieldModule,
        ReactiveFormsModule,
        MatInputModule,
        MatCardModule,
        MatButtonModule
      ],
      providers: [
        ImageCaptchaService,
        TranslateService
      ]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DataExportComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should compile', () => {
    expect(component).toBeTruthy()
  })
})
