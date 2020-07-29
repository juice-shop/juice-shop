/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { ChatbotService } from '../Services/chatbot.service'
import { UserService } from '../Services/user.service'
import { Component, OnInit } from '@angular/core'
import { FormControl } from '@angular/forms'
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
  public juicyImageSrc: string = 'assets/public/images/JuicyChatBot.png'
  public profileImageSrc: string = 'assets/public/images/uploads/default.svg'

  constructor (private userService: UserService, private chatbotService: ChatbotService, private formSubmitService: FormSubmitService, private translate: TranslateService) { }

  ngOnInit () {
    this.chatbotService.getChatbotStatus().subscribe((response) => {
      this.messages.push({
        author: MessageSources.bot,
        body: response.body
      })
    })

    this.userService.whoAmI().subscribe((user: any) => {
      console.log(user)
      this.profileImageSrc = user.profileImage
    }, (err) => {
      console.log(err)
    })
  }

  sendMessage() {
    let messageBody = this.messageControl.value
    if (messageBody) {
      this.chatbotService.getChatbotStatus().subscribe((response) => {
        if (!response.status) {
          this.messages.push({
            author: MessageSources.bot,
            body: response.body
          })
        } else {
          this.messages.push({
            author: MessageSources.user,
            body: messageBody
          })
          this.messageControl.setValue('')
    
          this.chatbotService.getResponse(messageBody).subscribe((response) => {
            this.messages.push({
              author: MessageSources.bot,
              body: response.body
            })
          })
        }
      })
    }
  }

}
