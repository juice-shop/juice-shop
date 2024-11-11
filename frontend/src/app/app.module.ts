/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { NgModule } from '@angular/core'
import { type HttpClient } from '@angular/common/http'
import { OverlayContainer } from '@angular/cdk/overlay'
import { TranslateHttpLoader } from '@ngx-translate/http-loader'
import { ConfigurationService } from './Services/configuration.service'

export function HttpLoaderFactory (http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json')
}

@NgModule(/* TODO(standalone-migration): clean up removed NgModule class manually.
{
    declarations: [AppComponent],
    imports: [
    BrowserModule,
    Routing,
    TranslateModule.forRoot({
        loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
        }
    }),
    CookieModule.forRoot(),
    MatPasswordStrengthModule.forRoot(),
    FlexLayoutModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    GalleryModule,
    NgxTextDiffModule,
    QrCodeModule,
    FileUploadModule,
    ClipboardModule,
    MatToolbarModule,
    MatIconModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatSidenavModule,
    MatRippleModule,
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
    MatBadgeModule,
    MatRadioModule,
    MatSnackBarModule,
    MatSliderModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatAutocompleteModule,
    HighlightModule,
    AboutComponent,
    AdministrationComponent,
    BasketComponent,
    LoginComponent,
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
    NFTUnlockComponent,
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
    CodeFixesComponent,
    MatSearchBarComponent
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
        KeysService,
        AddressService,
        QuantityService,
        WalletService,
        OrderHistoryService,
        DeliveryService,
        PhotoWallService
    ],
    bootstrap: [AppComponent]
} */)
export class AppModule {
  constructor (public configurationService: ConfigurationService, public overlayContainer: OverlayContainer) {
    configurationService.getApplicationConfiguration().subscribe((conf) => {
      overlayContainer.getContainerElement().classList.add(conf.application.theme + '-theme')
    })
  }
}
