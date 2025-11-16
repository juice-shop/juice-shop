/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { enableProdMode, importProvidersFrom } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'

import { AppModule, HttpLoaderFactory } from './app/app.module'
import { environment } from './environments/environment'
import { AppComponent } from './app/app.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatBadgeModule } from '@angular/material/badge';
import { MatGridListModule } from '@angular/material/grid-list';
import { LayoutModule } from '@angular/cdk/layout';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatRippleModule, MatNativeDateModule } from '@angular/material/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ClipboardModule } from 'ngx-clipboard';
import { FileUploadModule } from 'ng2-file-upload';
import { QrCodeModule } from 'ng-qrcode';
import { NgxTextDiffModule } from '@winarg/ngx-text-diff';
import { GalleryModule } from 'ng-gallery';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { Routing } from './app/app.routing';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { PhotoWallService } from './app/Services/photo-wall.service';
import { DeliveryService } from './app/Services/delivery.service';
import { OrderHistoryService } from './app/Services/order-history.service';
import { WalletService } from './app/Services/wallet.service';
import { QuantityService } from './app/Services/quantity.service';
import { AddressService } from './app/Services/address.service';
import { KeysService } from './app/Services/keys.service';
import { ImageCaptchaService } from './app/Services/image-captcha.service';
import { PaymentService } from './app/Services/payment.service';
import { AdminGuard, LoginGuard, AccountingGuard, DeluxeGuard } from './app/app.guard';
import { CookieService, CookieModule } from 'ngy-cookie';
import { ChallengeService } from './app/Services/challenge.service';
import { BasketService } from './app/Services/basket.service';
import { RecycleService } from './app/Services/recycle.service';
import { TrackOrderService } from './app/Services/track-order.service';
import { ChatbotService } from './app/Services/chatbot.service';
import { ComplaintService } from './app/Services/complaint.service';
import { ProductReviewService } from './app/Services/product-review.service';
import { WindowRefService } from './app/Services/window-ref.service';
import { FeedbackService } from './app/Services/feedback.service';
import { CaptchaService } from './app/Services/captcha.service';
import { SecurityAnswerService } from './app/Services/security-answer.service';
import { UserService } from './app/Services/user.service';
import { DataSubjectService } from './app/Services/data-subject.service';
import { SecurityQuestionService } from './app/Services/security-question.service';
import { AdministrationService } from './app/Services/administration.service';
import { ConfigurationService } from './app/Services/configuration.service';
import { ProductService } from './app/Services/product.service';
import { HIGHLIGHT_OPTIONS, HighlightModule } from 'ngx-highlightjs';
import { RequestInterceptor } from './app/Services/request.interceptor';
import { HTTP_INTERCEPTORS, HttpClient, withInterceptorsFromDi, provideHttpClient } from '@angular/common/http';

if (environment.production) {
  enableProdMode()
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule, Routing, TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }), CookieModule.forRoot(), ReactiveFormsModule, GalleryModule, NgxTextDiffModule, QrCodeModule, FileUploadModule, ClipboardModule, MatToolbarModule, MatIconModule, FormsModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatSidenavModule, MatRippleModule, MatTableModule, MatPaginatorModule, MatCardModule, MatInputModule, MatCheckboxModule, MatDialogModule, MatDividerModule, MatDatepickerModule, MatNativeDateModule, MatExpansionModule, MatProgressBarModule, MatTooltipModule, MatMenuModule, MatListModule, MatButtonToggleModule, LayoutModule, MatGridListModule, MatBadgeModule, MatRadioModule, MatSnackBarModule, MatSliderModule, MatTabsModule, MatSlideToggleModule, MatChipsModule, MatAutocompleteModule, HighlightModule),
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
        PhotoWallService,
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimations()
    ]
})
  .catch((err: Error) => console.log(err))
