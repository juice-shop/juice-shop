import { TranslateModule } from '@ngx-translate/core'
import { MatDividerModule } from '@angular/material/divider'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { async, ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatCardModule } from '@angular/material/card'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule } from '@angular/material/paginator'
import { of } from 'rxjs'
import { MatFormFieldModule } from '@angular/material/form-field'
import { throwError } from 'rxjs/internal/observable/throwError'
import { MatDialogModule, MatExpansionModule, MatIconModule, MatInputModule, MatTooltipModule } from '@angular/material'
import { PhotoWallComponent } from './photo-wall.component'
import { PhotoWallService } from '../Services/photo-wall.service'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ConfigurationService } from '../Services/configuration.service'

describe('PhotoWallComponent', () => {
  let component: PhotoWallComponent
  let fixture: ComponentFixture<PhotoWallComponent>
  let photoWallService: any
  let configurationService: any
  beforeEach(async(() => {

    configurationService = jasmine.createSpyObj('ConfigurationService',['getApplicationConfiguration'])
    configurationService.getApplicationConfiguration.and.returnValue(of({}))
    photoWallService = jasmine.createSpyObj('PhotoWallService', ['get', 'addMemory'])
    photoWallService.get.and.returnValue(of([]))
    photoWallService.addMemory.and.returnValue(of({}))

    TestBed.configureTestingModule({
      declarations: [ PhotoWallComponent ],
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
        MatCardModule,
        MatIconModule,
        MatTooltipModule,
        MatDialogModule,
        MatExpansionModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule
      ],
      providers: [
        { provide: PhotoWallService, useValue: photoWallService },
        { provide: ConfigurationService, useValue: configurationService }
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PhotoWallComponent)
    component = fixture.componentInstance
    component.ngOnInit()
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should make emptyState true and hold no memories when get API gives empty response', () => {
    photoWallService.get.and.returnValue(of([]))
    component.ngOnInit()
    expect(component.emptyState).toBe(true)
    expect(component.slideshowDataSource).toEqual([])
  })

  it('should make emptyState false when get API gives non empty response', () => {
    photoWallService.get.and.returnValue(of([{ imagePath: '', caption: '' }]))
    component.ngOnInit()
    expect(component.emptyState).toBe(false)
  })

  it('should log error from get API call directly to browser console', fakeAsync(() => {
    photoWallService.get.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    fixture.detectChanges()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should log error from addMemory API call directly to browser console', fakeAsync(() => {
    photoWallService.addMemory.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.save()
    fixture.detectChanges()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should add new memory to photo wall', () => {
    photoWallService.addMemory.and.returnValue(of({}))
    spyOn(component,'ngOnInit')
    spyOn(component,'resetForm')
    component.save()
    expect(component.ngOnInit).toHaveBeenCalled()
    expect(component.resetForm).toHaveBeenCalled()
  })

  it('should reinitizalise add memory form by calling resetForm', () => {
    component.form.get('image').setValue(new File([''], 'image'))
    component.form.get('caption').setValue('Juice Party')
    component.resetForm()
    expect(component.form.get('image').value).toBe('')
    expect(component.form.get('image').pristine).toBe(true)
    expect(component.form.get('image').untouched).toBe(true)
    expect(component.form.get('caption').value).toBe('')
    expect(component.form.get('caption').pristine).toBe(true)
    expect(component.form.get('caption').untouched).toBe(true)
  })

  it('should use custom twitter handle if configured', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { twitterUrl: 'twitter' } }))
    component.ngOnInit()
    expect(component.twitterHandle).toBe('twitter')
  })

  it('should log error while getting application configuration from backend API directly to browser console', fakeAsync(() => {
    configurationService.getApplicationConfiguration.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))
})
