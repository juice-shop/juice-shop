import { sanitizeUrl } from '@braintree/sanitize-url'

export function buildPaymentRedirectUrl(baseUrl: string, orderId: string): string {
  const redirectUrl = `${baseUrl}/#/payment/checkout?orderId=${orderId}`
  return sanitizeUrl(redirectUrl)
}
