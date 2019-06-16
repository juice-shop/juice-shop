import { TestBed } from '@angular/core/testing'
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core'
import { MatSnackBarModule } from '@angular/material/snack-bar'

import { SnackBarHelperService } from './snack-bar-helper.service'

describe('SnackBarHelperService', () => {
  let translateService

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        }),
        MatSnackBarModule
      ],
      providers: [TranslateService]
    })
  )

  it('should be created', () => {
    const service: SnackBarHelperService = TestBed.get(SnackBarHelperService)
    expect(service).toBeTruthy()
  })
})
