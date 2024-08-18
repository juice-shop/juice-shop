{
    matcher: oauthMatcher,
    data: { params: (window.location.href).substr(window.location.href.indexOf('#')) },
    component: OAuthComponent
  },
  {
    path: atob('dG9rZW5zYWxlLWljby1lYQ=='),
    component: TokenSaleComponent
  },
  {
    path: '403',
    component: ErrorPageComponent
  },
  {
    path: '**',
    component: SearchResultComponent
  }
]

export const Routing = RouterModule.forRoot(routes, { useHash: true, relativeLinkResolution: 'legacy' })

export function oauthMatcher (url: UrlSegment[]): UrlMatchResult {
  if (url.length === 0) {
    return null as unknown as UrlMatchResult
  }
  const path = window.location.href
  if (path.includes('#access_token=')) {
    return ({ consumed: url })
  }

  return null as unknown as UrlMatchResult
}

export function tokenMatcher (url: UrlSegment[]): UrlMatchResult {
  if (url.length === 0) {
    return null as unknown as UrlMatchResult
  }

  const path = url[0].toString()
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  if (path.match((token1(25, 184, 174, 179, 182, 186) + (36669).toString(36).toLowerCase() + token2(13, 144, 87, 152, 139, 144, 83, 138) + (10).toString(36).toLowerCase()))) {
    return ({ consumed: url })
  }

  return null as unknown as UrlMatchResult
}

export function token1 (...args: number[]) {
  const L = Array.prototype.slice.call(args)
  const D = L.shift()
  return L.reverse().map(function (C, A) {
    return String.fromCharCode(C - D - 45 - A)
  }).join('')
}

export function token2 (...args: number[]) {
  const T = Array.prototype.slice.call(arguments)
  const M = T.shift()
  return T.reverse().map(function (m, H) {
    return String.fromCharCode(m - M - 24 - H)
  }).join('')
}