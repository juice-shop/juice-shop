import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { ImageCaptchaService } from '../Services/image-captcha.service'

@Component({
  selector: 'app-data-export',
  templateUrl: './data-export.component.html',
  styleUrls: ['./data-export.component.scss']
})
export class DataExportComponent implements OnInit {

  public captchaControl: FormControl = new FormControl('', [Validators.required])
  public formatControl: FormControl = new FormControl('', [Validators.required])
  public captcha: any
  private captchaId: any
  private dataRequest: any = undefined
  public confirmation: any
  public error: any
  public lastSuccessfulTry: any
  public presenceOfCaptcha: boolean = false
  public userData: any

  constructor (private imageCaptchaService: ImageCaptchaService) { }
  ngOnInit () {
    this.needCaptcha()
    this.dataRequest = {}
  }

  needCaptcha () {
    let nowTime = new Date()
    let timeOfCaptcha = localStorage.getItem('lastSuccessfulTry') ? new Date(JSON.parse(localStorage.getItem('lastSuccessfulTry'))) : new Date(0)
    if (nowTime.getTime() - timeOfCaptcha.getTime() < 300000) {
      this.getNewCaptcha()
      this.presenceOfCaptcha = true
    }
  }

  @ViewChild('dataContainer') dataContainer: ElementRef
  getNewCaptcha () {
    this.imageCaptchaService.getCaptcha().subscribe((data: any) => {
      this.captcha = data.image
      this.captchaId = data.captchaId
      this.dataContainer.nativeElement.innerHTML = this.captcha
    })
  }

  save () {
    if (this.presenceOfCaptcha) {
      this.dataRequest.captchaId = this.captchaId
      this.dataRequest.answer = this.captchaControl.value
    }
    this.dataRequest.format = this.formatControl.value
    this.imageCaptchaService.dataExport(this.dataRequest).subscribe((data: any) => {
      this.error = null
      this.confirmation = data.confirmation
      this.userData = data.userData
      window.open('', '_blank', 'width=500').document.write(this.userData)
      this.lastSuccessfulTry = new Date()
      localStorage.setItem('lastSuccessfulTry',JSON.stringify(this.lastSuccessfulTry))
      this.ngOnInit()
      this.resetForm()
    }, (error) => {
      this.error = error.error
      this.confirmation = null
      this.resetForm()
    })
  }

  resetForm () {
    this.captchaControl.markAsUntouched()
    this.captchaControl.markAsPristine()
    this.captchaControl.setValue('')
  }
}
