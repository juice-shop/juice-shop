# Pattern: Frontend unit tests (`frontend/src/**/*.spec.ts`)

Frontend tests run on **Vitest** through the Angular builder (`@angular/build:unit-test`) and use the Angular **`TestBed`** API with Jasmine-style globals (`describe`, `it`, `expect`, `beforeEach`). The spec file lives **next to** the file under test (`foo.service.ts` → `foo.service.spec.ts`). Run with `npm run test:frontend`; coverage with `npm run test:frontend:coverage` (→ `frontend/coverage/lcov.info`, `lcovonly` reporter).

## Service test skeleton (easiest coverage wins)

```typescript
/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { FooService } from './foo.service'

describe('FooService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [FooService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    })
  })

  it('should be created', () => {
    const service = TestBed.inject(FooService)
    expect(service).toBeTruthy()
  })

  it('should GET results directly via the rest api', () => {
    const service = TestBed.inject(FooService)
    const httpMock = TestBed.inject(HttpTestingController)

    let res: any
    service.find('id').subscribe((data) => (res = data))
    const req = httpMock.expectOne('http://localhost:3000/rest/foo/id')
    req.flush('apiResponse')
    expect(req.request.method).toBe('GET')
    expect(res).toBe('apiResponse')
    httpMock.verify()
  })

  it('should handle errors', () => {
    const service = TestBed.inject(FooService)
    const httpMock = TestBed.inject(HttpTestingController)

    let captured: any
    service.find('bad').subscribe({ next: () => {}, error: (e) => { captured = e } })
    httpMock.expectOne('http://localhost:3000/rest/foo/bad').flush(null, { status: 404, statusText: 'Not Found' })
    expect(captured.status).toBe(404)
    httpMock.verify()
  })
})
```

## Rules & conventions

- Keep the license header at the top of every new file.
- Use `provideHttpClientTesting()` + `HttpTestingController` for anything that calls the REST API — never hit a real backend. Always call `httpMock.verify()` at the end.
- Match the exact URL the service builds (base is `http://localhost:3000` in tests) and assert `req.request.method` / `req.request.body`.
- For **components**, configure the `TestBed` with the component and its required providers/mocks, create it via `TestBed.createComponent(...)`, call `fixture.detectChanges()`, and assert on the instance and rendered DOM. Cover `ngOnInit`, user interactions, output emissions, and error branches.
- Stub collaborating services with a plain object or Vitest spies (`vi.fn()`) supplied via `providers: [{ provide: SomeService, useValue: mock }]`.

## Study these real examples

- **Service with HttpTestingController + error branch** → `frontend/src/app/Services/track-order.service.spec.ts` (compact template).
- **More service examples** → `frontend/src/app/Services/*.service.spec.ts` (e.g. `product.service.spec.ts`, `user.service.spec.ts`).
- **Component tests** → `frontend/src/app/**/**.component.spec.ts` (e.g. `basket.component.spec.ts`, `change-password.component.spec.ts`).

Open the closest existing spec of the same kind and mirror its providers and structure before writing.
