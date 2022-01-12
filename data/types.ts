export interface Challenge {
  name: string
  category: string
  description: string
  difficulty: number
  hint: string
  hintUrl: string
  mitigationUrl?: string
  key: string
  disabledEnv?: string | string[]
  tutorial?: { order: number }
  tags?: string[]
}

export interface User {
  username?: string
  email: string
  password: string
  customDomain?: string
  key: string
  role: string
  deletedFlag?: boolean
  profileImage?: string
  securityQuestion?: {
    id: number
    answer: string
  }
  feedback?: {
    comment: string
    rating: number
  }
  address?: Address[]
  card?: Card[]
  totpSecret?: string
  walletBalance?: number
}

export interface Delivery {
  name: string
  price: number
  deluxePrice: number
  eta: number
  icon: string
}

export interface Address {
  fullName: string
  mobileNum: number
  zipCode: string
  streetAddress: string
  city: string
  state: string
  country: string
}

export interface Card {
  fullName: string
  cardNum: number
  expMonth: number
  expYear: number
}

export interface Product {
  name: string
  description: string
  price?: number
  deluxePrice?: number
  quantity?: number
  limitPerUser?: number
  image?: string
  reviews?: Review[]
  deletedDate?: string
  deletedAt?: Date | string
  useForChristmasSpecialChallenge?: boolean
  keywordsForPastebinDataLeakChallenge?: string[]
  urlForProductTamperingChallenge?: string
  fileForRetrieveBlueprintChallenge?: string
}

export interface Review {
  text: string
  author: string
}

export interface Memory {
  image: string
  caption: string
  user: string
  geoStalkingMetaSecurityQuestion?: number
  geoStalkingMetaSecurityAnswer?: string
  geoStalkingVisualSecurityQuestion?: number
  geoStalkingVisualSecurityAnswer?: string
}

export interface Recycle {
  UserId: number
  quantity: number
  AddressId: number
  date: string
  isPickup: boolean
}

export interface SecurityQuestion {
  question: string
}
