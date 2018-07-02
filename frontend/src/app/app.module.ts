import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http'
import { CookieModule, CookieService } from 'ngx-cookie'
import { ReactiveFormsModule } from '@angular/forms'
import { Routing } from './app.routing'
import { OverlayContainer } from '@angular/cdk/overlay'
import { TranslateModule, TranslateLoader } from '@ngx-translate/core'
import { TranslateHttpLoader } from '@ngx-translate/http-loader'
import { QRCodeModule } from 'angularx-qrcode'
import { BarRatingModule } from 'ngx-bar-rating'
import { ClipboardModule } from 'ngx-clipboard'

/* Imported Components */
import { AppComponent } from './app.component'
import { AboutComponent } from './about/about.component'
import { AdministrationComponent } from './administration/administration.component'
import { BasketComponent } from './basket/basket.component'
import { LoginComponent } from './login/login.component'
import { ScoreBoardComponent } from './score-board/score-board.component'
import { NavbarComponent } from './navbar/navbar.component'
import { SearchResultComponent } from './search-result/search-result.component'
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component'
import { RegisterComponent } from './register/register.component'
import { ContactComponent } from './contact/contact.component'
import { ChangePasswordComponent } from './change-password/change-password.component'
import { ProductDetailsComponent } from './product-details/product-details.component'
import { ComplaintComponent } from './complaint/complaint.component'
import { TrackOrderComponent } from './track-order/track-order.component'
import { TrackResultComponent } from './track-result/track-result.component'
import { RecycleComponent } from './recycle/recycle.component'
import { QrCodeComponent } from './qr-code/qr-code.component'
import { UserDetailsComponent } from './user-details/user-details.component'
import { ServerStartedNotificationComponent } from './server-started-notification/server-started-notification.component'
import { ChallengeSolvedNotificationComponent } from './challenge-solved-notification/challenge-solved-notification.component'
import { OAuthComponent } from './oauth/oauth.component'

/* Imported Services */
import { RequestInterceptor } from './Services/request.interceptor'
import { ProductService } from './Services/product.service'
import { ConfigurationService } from './Services/configuration.service'
import { AdministrationService } from './Services/administration.service'
import { SecurityQuestionService } from './Services/security-question.service'
import { UserService } from './Services/user.service'
import { SecurityAnswerService } from './Services/security-answer.service'
import { FeedbackService } from './Services/feedback.service'
import { CaptchaService } from './Services/captcha.service'
import { WindowRefService } from './Services/window-ref.service'
import { ProductReviewService } from './Services/product-review.service'
import { FileUploadService } from './Services/file-upload.service'
import { ComplaintService } from './Services/complaint.service'
import { TrackOrderService } from './Services/track-order.service'
import { RecycleService } from './Services/recycle.service'
import { BasketService } from './Services/basket.service'
import { ChallengeService } from './Services/challenge.service'

/* Modules required for Angular Material */
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatIconModule } from '@angular/material/icon'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatSelectModule } from '@angular/material/select'
import { MatButtonModule } from '@angular/material/button'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatCardModule } from '@angular/material/card'
import { MatInputModule } from '@angular/material/input'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatDialogModule } from '@angular/material/dialog'
import { MatDividerModule } from '@angular/material/divider'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatNativeDateModule } from '@angular/material/core'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatMenuModule } from '@angular/material/menu'
import { MatListModule } from '@angular/material/list';
import { TokenSaleComponent } from './token-sale/token-sale.component'

export function HttpLoaderFactory (http: HttpClient) {
  return new TranslateHttpLoader(http,'./../assets/i18n/' , '.json')
}

@NgModule({
  declarations: [
    AppComponent,
    AboutComponent,
    AdministrationComponent,
    BasketComponent,
    LoginComponent,
    ScoreBoardComponent,
    NavbarComponent,
    SearchResultComponent,
    ForgotPasswordComponent,
    RegisterComponent,
    ContactComponent,
    ChangePasswordComponent,
    ProductDetailsComponent,
    ComplaintComponent,
    TrackOrderComponent,
    TrackResultComponent,
    RecycleComponent,
    QrCodeComponent,
    UserDetailsComponent,
    ServerStartedNotificationComponent,
    ChallengeSolvedNotificationComponent,
    OAuthComponent,
    TokenSaleComponent
  ],
  entryComponents: [ ProductDetailsComponent,QrCodeComponent, UserDetailsComponent ],
  imports: [
    BrowserModule,
    Routing,
    TranslateModule.forRoot(
      {
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [ HttpClient ]
        }
      }
    ),
    CookieModule.forRoot(),
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    QRCodeModule,
    BarRatingModule,
    ClipboardModule,
    MatToolbarModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatSidenavModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatInputModule,
    MatCheckboxModule,
    MatDialogModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatMenuModule,
    MatListModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptor,
      multi: true
    },
    ProductService,
    ConfigurationService,
    AdministrationService,
    SecurityQuestionService,
    UserService,
    SecurityAnswerService,
    CaptchaService,
    FeedbackService,
    WindowRefService,
    ProductReviewService,
    FileUploadService,
    ComplaintService,
    TrackOrderService,
    RecycleService,
    BasketService,
    ChallengeService,
    CookieService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor (configurationService: ConfigurationService,overlayContainer: OverlayContainer) {
    configurationService.getApplicationConfiguration().subscribe((conf) => {
      overlayContainer.getContainerElement().classList.add(conf.application.theme)
    })
  }

}
