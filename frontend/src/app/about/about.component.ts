import { Component, OnInit } from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'
import { ConfigurationService } from '../Services/configuration.service'
import { FeedbackService } from '../Services/feedback.service'
import { IImage } from 'ng-simple-slideshow'
import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faFacebook, faTwitter, faSlack } from '@fortawesome/free-brands-svg-icons'
import { faNewspaper, faStar } from '@fortawesome/free-regular-svg-icons'
import { faStar as fasStar } from '@fortawesome/free-solid-svg-icons'

library.add(faFacebook, faTwitter, faSlack, faNewspaper, faStar, fasStar)
dom.watch()

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  public twitterUrl = null
  public facebookUrl = null
  public slackUrl = null
  public pressKitUrl = null
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
      if (config && config.application) {
        if (config.application.twitterUrl !== null) {
          this.twitterUrl = config.application.twitterUrl
        }
        if (config.application.facebookUrl !== null) {
          this.facebookUrl = config.application.facebookUrl
        }
        if (config.application.slackUrl !== null) {
          this.slackUrl = config.application.slackUrl
        }
        if (config.application.pressKitUrl !== null) {
          this.pressKitUrl = config.application.pressKitUrl
        }
      }
    },(err) => console.log(err))
  }

  populateSlideshowFromFeedbacks () {
    this.feedbackService.find().subscribe((feedbacks) => {
      for (let i = 0; i < feedbacks.length; i++) {
        feedbacks[i].comment = feedbacks[i].comment + ' (' + this.stars[feedbacks[i].rating] + ')'
        feedbacks[i].comment = this.sanitizer.bypassSecurityTrustHtml(feedbacks[i].comment)
        this.slideshowDataSource.push({ url: this.images[i % this.images.length], caption: feedbacks[i].comment })
      }
    },(err) => {
      console.log(err)
    })
  }
}
