/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { BrowserModule } from '@angular/platform-browser'
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http'
import { CookieModule, CookieService } from 'ngx-cookie'
import { ReactiveFormsModule } from '@angular/forms'
import { Routing } from './app.routing'
import { OverlayContainer } from '@angular/cdk/overlay'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { TranslateHttpLoader } from '@ngx-translate/http-loader'
import { QRCodeModule } from 'anuglar2-qrcode'
import { ClipboardModule } from 'ngx-clipboard'
import { FileUploadModule } from 'ng2-file-upload'
import { SlideshowModule } from 'ng-simple-slideshow'
import { NgxSpinnerModule } from 'ngx-spinner'
import { AppComponent } from './app.component'
import { AboutComponent } from './about/about.component'
import { AdministrationComponent } from './administration/administration.component'
import { BasketComponent } from './basket/basket.component'
import { LoginComponent } from './login/login.component'
import { ScoreBoardComponent } from './score-board/score-board.component'
import { NavbarComponent } from './navbar/navbar.component'
import { WelcomeComponent } from './welcome/welcome.component'
import { WelcomeBannerComponent } from './welcome-banner/welcome-banner.component'
import { SearchResultComponent } from './search-result/search-result.component'
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component'
import { RegisterComponent } from './register/register.component'
import { ContactComponent } from './contact/contact.component'
import { ChangePasswordComponent } from './change-password/change-password.component'
import { ProductDetailsComponent } from './product-details/product-details.component'
import { ComplaintComponent } from './complaint/complaint.component'
import { ChatbotComponent } from './chatbot/chatbot.component'
import { TrackResultComponent } from './track-result/track-result.component'
import { RecycleComponent } from './recycle/recycle.component'
import { QrCodeComponent } from './qr-code/qr-code.component'
import { UserDetailsComponent } from './user-details/user-details.component'
import { ServerStartedNotificationComponent } from './server-started-notification/server-started-notification.component'
import {
  ChallengeSolvedNotificationComponent
} from './challenge-solved-notification/challenge-solved-notification.component'
import { OAuthComponent } from './oauth/oauth.component'
import { TokenSaleComponent } from './token-sale/token-sale.component'
import { ProductReviewEditComponent } from './product-review-edit/product-review-edit.component'
import { TwoFactorAuthEnterComponent } from './two-factor-auth-enter/two-factor-auth-enter.component'
import { PrivacySecurityComponent } from './privacy-security/privacy-security.component'
import { ErrorPageComponent } from './error-page/error-page.component'
import { NgMatSearchBarModule } from 'ng-mat-search-bar'
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
import { ComplaintService } from './Services/complaint.service'
import { ChatbotService } from './Services/chatbot.service'
import { TrackOrderService } from './Services/track-order.service'
import { RecycleService } from './Services/recycle.service'
import { BasketService } from './Services/basket.service'
import { ChallengeService } from './Services/challenge.service'
import { DataSubjectService } from './Services/data-subject.service'
import { ImageCaptchaService } from './Services/image-captcha.service'
import { AddressService } from './Services/address.service'
import { QuantityService } from './Services/quantity.service'
import { FlexLayoutModule } from '@angular/flex-layout'
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
import { MatListModule } from '@angular/material/list'
import { SidenavComponent } from './sidenav/sidenav.component'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { LayoutModule } from '@angular/cdk/layout'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatRadioModule } from '@angular/material/radio'
import { MatBadgeModule } from '@angular/material/badge'
import { HighlightModule, HIGHLIGHT_OPTIONS } from 'ngx-highlightjs'
import { TwoFactorAuthComponent } from './two-factor-auth/two-factor-auth.component'
import { DataExportComponent } from './data-export/data-export.component'
import { LastLoginIpComponent } from './last-login-ip/last-login-ip.component'
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component'
import { AddressCreateComponent } from './address-create/address-create.component'
import { AddressSelectComponent } from './address-select/address-select.component'
import { PaymentService } from './Services/payment.service'
import { PaymentComponent } from './payment/payment.component'
import { PaymentMethodComponent } from './payment-method/payment-method.component'
import { SavedPaymentMethodsComponent } from './saved-payment-methods/saved-payment-methods.component'
import { AccountingComponent } from './accounting/accounting.component'
import { OrderSummaryComponent } from './order-summary/order-summary.component'
import { PurchaseBasketComponent } from './purchase-basket/purchase-basket.component'
import { AddressComponent } from './address/address.component'
import { SavedAddressComponent } from './saved-address/saved-address.component'
import { ChallengeStatusBadgeComponent } from './challenge-status-badge/challenge-status-badge.component'
import { OrderCompletionComponent } from './order-completion/order-completion.component'
import { WalletComponent } from './wallet/wallet.component'
import { WalletService } from './Services/wallet.service'
import { OrderHistoryComponent } from './order-history/order-history.component'
import { OrderHistoryService } from './Services/order-history.service'
import { DeliveryMethodComponent } from './delivery-method/delivery-method.component'
import { DeliveryService } from './Services/delivery.service'
import { PhotoWallComponent } from './photo-wall/photo-wall.component'
import { PhotoWallService } from './Services/photo-wall.service'
import { DeluxeUserComponent } from './deluxe-user/deluxe-user.component'
import { AccountingGuard, AdminGuard, DeluxeGuard, LoginGuard } from './app.guard'
import { MatPasswordStrengthModule } from '@angular-material-extensions/password-strength'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { FeedbackDetailsComponent } from './feedback-details/feedback-details.component'
import { MatSliderModule } from '@angular/material/slider'
import { MatTabsModule } from '@angular/material/tabs'
import { MatChipsModule } from '@angular/material/chips'
import { CodeSnippetComponent } from './code-snippet/code-snippet.component'
import { CodeAreaComponent } from './code-area/code-area.component'
import { NgxTextDiffModule } from 'ngx-text-diff'
import { CodeFixesComponent } from './code-fixes/code-fixes.component'

export function HttpLoaderFactory (http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json')
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
    WelcomeComponent,
    WelcomeBannerComponent,
    SearchResultComponent,
    ForgotPasswordComponent,
    RegisterComponent,
    ContactComponent,
    ChangePasswordComponent,
    ProductDetailsComponent,
    ComplaintComponent,
    ChatbotComponent,
    TrackResultComponent,
    RecycleComponent,
    QrCodeComponent,
    UserDetailsComponent,
    ServerStartedNotificationComponent,
    ChallengeSolvedNotificationComponent,
    OAuthComponent,
    TokenSaleComponent,
    ProductReviewEditComponent,
    TwoFactorAuthEnterComponent,
    SidenavComponent,
    PrivacySecurityComponent,
    ErrorPageComponent,
    TwoFactorAuthComponent,
    DataExportComponent,
    LastLoginIpComponent,
    PrivacyPolicyComponent,
    OrderCompletionComponent,
    AddressCreateComponent,
    AddressSelectComponent,
    AddressComponent,
    SavedAddressComponent,
    PaymentComponent,
    PaymentMethodComponent,
    SavedPaymentMethodsComponent,
    AccountingComponent,
    OrderSummaryComponent,
    PurchaseBasketComponent,
    PrivacyPolicyComponent,
    ChallengeStatusBadgeComponent,
    WalletComponent,
    OrderHistoryComponent,
    DeliveryMethodComponent,
    PhotoWallComponent,
    DeluxeUserComponent,
    FeedbackDetailsComponent,
    CodeSnippetComponent,
    CodeAreaComponent,
    CodeFixesComponent
  ],
  imports: [
    BrowserModule,
    Routing,
    TranslateModule.forRoot(
      {
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      }
    ),
    CookieModule.forRoot(),
    MatPasswordStrengthModule.forRoot(),
    FlexLayoutModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    SlideshowModule,
    QRCodeModule,
    FileUploadModule,
    ClipboardModule,
    NgxSpinnerModule,
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
    MatListModule,
    MatButtonToggleModule,
    LayoutModule,
    MatGridListModule,
    NgMatSearchBarModule,
    MatBadgeModule,
    MatRadioModule,
    MatSnackBarModule,
    MatSliderModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatChipsModule,
    NgxTextDiffModule,
    HighlightModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptor,
      multi: true
    },
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        coreLibraryLoader: async () => await import('highlight.js/lib/core'),
        lineNumbersLoader: async () => await import('highlightjs-line-numbers.js'),
        languages: {
          typescript: async () => await import('highlight.js/lib/languages/typescript'),
          javascript: async () => await import('highlight.js/lib/languages/javascript'),
          yaml: async () => await import('highlight.js/lib/languages/yaml')
        }
      }
    },
    ProductService,
    ConfigurationService,
    AdministrationService,
    SecurityQuestionService,
    DataSubjectService,
    UserService,
    SecurityAnswerService,
    CaptchaService,
    FeedbackService,
    WindowRefService,
    ProductReviewService,
    ComplaintService,
    ChatbotService,
    TrackOrderService,
    RecycleService,
    BasketService,
    ChallengeService,
    CookieService,
    AdminGuard,
    LoginGuard,
    PaymentService,
    AccountingGuard,
    DeluxeGuard,
    ImageCaptchaService,
    AddressService,
    QuantityService,
    WalletService,
    OrderHistoryService,
    DeliveryService,
    PhotoWallService
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
  constructor (public configurationService: ConfigurationService, public overlayContainer: OverlayContainer) {
    configurationService.getApplicationConfiguration().subscribe((conf) => {
      overlayContainer.getContainerElement().classList.add(conf.application.theme + '-theme')
    })
  }
}
