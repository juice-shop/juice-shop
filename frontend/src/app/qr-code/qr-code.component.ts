import { MAT_DIALOG_DATA } from '@angular/material/dialog'
import { Component, Inject, OnInit } from '@angular/core'
import fontawesome from '@fortawesome/fontawesome'
import { faArrowCircleLeft } from '@fortawesome/fontawesome-free-solid'

fontawesome.library.add(faArrowCircleLeft)

@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss']
})
export class QrCodeComponent implements OnInit {

  public title: string
  public url: string
  public address: string
  public data: string
  constructor (@Inject(MAT_DIALOG_DATA) public dialogData: any) { }

  ngOnInit () {
    this.title = this.dialogData.title
    this.url = this.dialogData.url
    this.address = this.dialogData.address
    this.data = this.dialogData.data
  }

}
