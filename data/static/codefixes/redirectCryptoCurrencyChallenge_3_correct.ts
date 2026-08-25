export const redirectAllowlist = new Set([
  'https://github.com/juice-shop/juice-shop',
  'https://shop.spreadshirt.com/juiceshop',
  'https://shop.spreadshirt.de/juiceshop',
  'https://www.stickeryou.com/products/owasp-juice-shop/794',
  'https://leanpub.com/juice-shop'
])

export const isRedirectAllowed = (url: string) => {
  let allowed = false
  for (const allowedUrl of redirectAllowlist) {
    allowed = allowed || url.includes(allowedUrl)
  }
  return allowed
}
