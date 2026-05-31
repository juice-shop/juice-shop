import type { AddressModel } from '@juice-shop/models/address'
import type { BasketModel } from '@juice-shop/models/basket'
import type { BasketItemModel } from '@juice-shop/models/basketitem'
import type { CaptchaModel } from '@juice-shop/models/captcha'
import type { CardModel } from '@juice-shop/models/card'
import type { ChallengeModel } from '@juice-shop/models/challenge'
import type { DeliveryModel } from '@juice-shop/models/delivery'
import type { MemoryModel } from '@juice-shop/models/memory'
import type { ProductModel } from '@juice-shop/models/product'
import type { RecycleModel } from '@juice-shop/models/recycle'
import type { SecurityAnswerModel } from '@juice-shop/models/securityAnswer'
import type { SecurityQuestionModel } from '@juice-shop/models/securityQuestion'
import type { UserModel } from '@juice-shop/models/user'

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
