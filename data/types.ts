import type { AddressModel } from 'models/address'
import type { BasketModel } from 'models/basket'
import type { BasketItemModel } from 'models/basketitem'
import type { CaptchaModel } from 'models/captcha'
import type { CardModel } from 'models/card'
import type { ChallengeModel } from 'models/challenge'
import type { DeliveryModel } from 'models/delivery'
import type { MemoryModel } from 'models/memory'
import type { ProductModel } from 'models/product'
import type { RecycleModel } from 'models/recycle'
import type { SecurityAnswerModel } from 'models/securityAnswer'
import type { SecurityQuestionModel } from 'models/securityQuestion'
import type { UserModel } from 'models/user'

export type Challenge = ChallengeModel

export type User = UserModel

export type Delivery = DeliveryModel

export type Address = AddressModel

export type Card = CardModel

export type Product = ProductModel

export interface Review {
  text: string
  author: string
  liked: boolean
  likedBy: string[]
}

export type Memory = MemoryModel

export type Recycle = RecycleModel

export type SecurityQuestion = SecurityQuestionModel

export type SecurityAnswer = SecurityAnswerModel

export type Basket = BasketModel

export type BasketItem = BasketItemModel

export type Captcha = CaptchaModel
