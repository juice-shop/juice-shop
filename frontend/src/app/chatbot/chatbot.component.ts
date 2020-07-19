/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { ComplaintService } from '../Services/complaint.service'
import { UserService } from '../Services/user.service'
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { faBomb } from '@fortawesome/free-solid-svg-icons'
import { FormSubmitService } from '../Services/form-submit.service'
import { TranslateService } from '@ngx-translate/core'

library.add(faBomb)
dom.watch()

enum MessageSources {
  user = "user",
  bot = "bot"
}

interface ChatMessage {
  author: MessageSources.user | MessageSources.bot
  body: string
}

@Component({
  selector: 'app-complaint',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit {

  public messageControl: FormControl = new FormControl()
  public messages: ChatMessage[] = []

  constructor (private userService: UserService, private complaintService: ComplaintService, private formSubmitService: FormSubmitService, private translate: TranslateService) { }

  ngOnInit () {
    const dummyMessage: ChatMessage = {
      author: MessageSources.bot,
      body: "Hi there juicy"
    }
    this.messages.push(dummyMessage)
    this.messages.push(dummyMessage)
    this.messages.push(dummyMessage)
  }

  sendMessage() {
    let messageBody = this.messageControl.value
    if (messageBody) {
      this.messages.push({
        author: MessageSources.user,
        body: messageBody
      })
      this.messageControl.setValue('')
    }
    console.log(this.messages)
  }

}
