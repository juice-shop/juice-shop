import { Component, OnInit } from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'
import { ConfigurationService } from '../Services/configuration.service'
import { FeedbackService } from '../Services/feedback.service'
import { IImage } from 'ng-simple-slideshow'
import fontawesome from '@fortawesome/fontawesome'
import { faFacebook, faTwitter } from '@fortawesome/fontawesome-free-brands'

fontawesome.library.add(faFacebook, faTwitter)

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  public twitterUrl = null
  public facebookUrl = null
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
      }
    },(err) => console.log(err))
  }

  populateSlideshowFromFeedbacks () {
    this.feedbackService.find().subscribe((feedbacks) => {
      for (let i = 0; i < feedbacks.length; i++) {
        feedbacks[i].comment = this.sanitizer.bypassSecurityTrustHtml(feedbacks[i].comment)
        this.slideshowDataSource.push({ url: this.images[i % this.images.length], caption: feedbacks[i].comment })
      }
    },(err) => {
      console.log(err)
    })
  }
}
