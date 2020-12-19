/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { Component, OnInit } from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'
import { ConfigurationService } from '../Services/configuration.service'
import { FeedbackService } from '../Services/feedback.service'
import { IImage } from 'ng-simple-slideshow'
import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { faFacebook, faReddit, faSlack, faTwitter } from '@fortawesome/free-brands-svg-icons'
import { faNewspaper, faStar } from '@fortawesome/free-regular-svg-icons'
import { faStar as fasStar } from '@fortawesome/free-solid-svg-icons'

library.add(faFacebook, faTwitter, faSlack, faReddit, faNewspaper, faStar, fasStar)
dom.watch()

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  public twitterUrl?: string
  public facebookUrl?: string
  public slackUrl?: string
  public redditUrl?: string
  public pressKitUrl?: string
  public slideshowDataSource: IImage[] = []

  private images = [
    'assets/public/images/carousel/1.jpg',
    'assets/public/images/carousel/2.jpg',
    'assets/public/images/carousel/3.jpg',
    'assets/public/images/carousel/4.jpg',
    'assets/public/images/carousel/5.png',
    'assets/public/images/carousel/6.jpg',
    'assets/public/images/carousel/7.jpg'
  ]

  private stars = [
    null,
    '<i class="fas fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i>',
    '<i class="fas fa-star"></i><i class="fas fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i>',
    '<i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i>',
    '<i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="far fa-star"></i>',
    '<i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>'
  ]

  constructor (private configurationService: ConfigurationService, private feedbackService: FeedbackService, private sanitizer: DomSanitizer) {}

  ngOnInit () {
    this.populateSlideshowFromFeedbacks()
    this.configurationService.getApplicationConfiguration().subscribe((config) => {
      if (config && config.application && config.application.social) {
        if (config.application.social.twitterUrl) {
          this.twitterUrl = config.application.social.twitterUrl
        }
        if (config.application.social.facebookUrl) {
          this.facebookUrl = config.application.social.facebookUrl
        }
        if (config.application.social.slackUrl) {
          this.slackUrl = config.application.social.slackUrl
        }
        if (config.application.social.redditUrl) {
          this.redditUrl = config.application.social.redditUrl
        }
        if (config.application.social.pressKitUrl) {
          this.pressKitUrl = config.application.social.pressKitUrl
        }
      }
    },(err) => console.log(err))
  }

  populateSlideshowFromFeedbacks () {
    this.feedbackService.find().subscribe((feedbacks) => {
      for (let i = 0; i < feedbacks.length; i++) {
        feedbacks[i].comment = '<span style="width: 90%; display:block;">' + feedbacks[i].comment + '<br/>' + ' (' + this.stars[feedbacks[i].rating] + ')' + '</span>'
        feedbacks[i].comment = this.sanitizer.bypassSecurityTrustHtml(feedbacks[i].comment)
        this.slideshowDataSource.push({ url: this.images[i % this.images.length], caption: feedbacks[i].comment })
      }
    },(err) => {
      console.log(err)
    })
  }
}
