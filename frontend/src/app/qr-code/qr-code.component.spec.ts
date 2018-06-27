import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatDividerModule } from '@angular/material/divider'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { QRCodeModule } from 'angularx-qrcode'

import { QrCodeComponent } from './qr-code.component'
import { MatButtonModule } from '@angular/material/button'

describe('QrCodeComponent', () => {
  let component: QrCodeComponent
  let fixture: ComponentFixture<QrCodeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        QRCodeModule,
        MatDividerModule,
        MatButtonModule,
        MatDialogModule
      ],
      declarations: [ QrCodeComponent ],
      providers: [
         { provide: MAT_DIALOG_DATA, useValue: { productData: {} } }
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(QrCodeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  xit('should create', () => {
    expect(component).toBeTruthy()
  })
})
