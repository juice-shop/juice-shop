import { Component, OnInit } from '@angular/core'
import { ConfigurationService } from '../Services/configuration.service'
import { MatDialogRef } from '@angular/material'
import { CookieService } from 'ngx-cookie'
import { startHackingInstructorFor } from '../../hacking-instructor'

@Component({
  selector: 'app-welcome-banner',
  templateUrl: 'welcome-banner.component.html',
  styleUrls: ['./welcome-banner.component.scss']
})
export class WelcomeBannerComponent implements OnInit {
  public title: string = 'Welcome to OWASP Juice Shop'
  public message: string = "<p>Being a web application with a vast number of intended security vulnerabilities, the <strong>OWASP Juice Shop</strong> is supposed to be the opposite of a best practice or template application for web developers: It is an awareness, training, demonstration and exercise tool for security risks in modern web applications. The <strong>OWASP Juice Shop</strong> is an open-source project hosted by the non-profit <a href='https://owasp.org' target='_blank'>Open Web Application Security Project (OWASP)</a> and is developed and maintained by volunteers. Check out the link below for more information and documentation on the project.</p><h1><a href='http://owasp-juice.shop' target='_blank'>http://owasp-juice.shop</a></h1>"
  public showHackingInstructor: boolean = true

  private readonly welcomeBannerStatusCookieKey = 'welcomebanner_status'

  constructor (
        public dialogRef: MatDialogRef<WelcomeBannerComponent>,
        private configurationService: ConfigurationService,
        private cookieService: CookieService) { }

  ngOnInit (): void {
    this.configurationService.getApplicationConfiguration().subscribe((config) => {
      if (config && config.application && config.application.welcomeBanner) {
        this.title = config.application.welcomeBanner.title
        this.message = config.application.welcomeBanner.message
      }
      if (config && config.application) {
        this.showHackingInstructor = config.application.showHackingInstructor
      }
    }, (err) => console.log(err))
  }

  startHackingInstructor () {
    console.log('Starting instructions for challenge "Score Board"')
    startHackingInstructorFor('Score Board')
  }

  closeWelcome (): void {
    this.dialogRef.close()
    this.cookieService.put(this.welcomeBannerStatusCookieKey, 'dismiss')
  }
}
