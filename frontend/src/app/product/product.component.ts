import { Component, inject, input } from '@angular/core'
import { BasketService } from '../Services/basket.service'
import { ProductService } from '../Services/product.service'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { ProductTableEntry } from '../Models/product.model'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MatCardModule } from '@angular/material/card'
import { MatTooltip } from '@angular/material/tooltip'
import { MatButton } from '@angular/material/button'
import { MatIcon } from '@angular/material/icon'

@Component({
  selector: 'app-product',
  imports: [TranslateModule, MatCardModule, MatTooltip, MatButton, MatIcon],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent {
  private readonly basketService = inject(BasketService)
  private readonly productService = inject(ProductService)
  private readonly translateService = inject(TranslateService)
  private readonly snackBarHelperService = inject(SnackBarHelperService)

  item = input.required<ProductTableEntry>()
  isLoggedIn = input.required<boolean>()
  isDeluxe = input.required<boolean>()

  addToBasket(id?: number) {
    this.basketService.find(Number(sessionStorage.getItem('bid'))).subscribe({
      next: (basket) => {
        const productsInBasket: any = basket.Products
        let found = false
        for (let i = 0; i < productsInBasket.length; i++) {
          if (productsInBasket[i].id === id) {
            found = true
            this.basketService
              .get(productsInBasket[i].BasketItem.id)
              .subscribe({
                next: (existingBasketItem) => {
                  const newQuantity = existingBasketItem.quantity + 1
                  this.basketService
                    .put(existingBasketItem.id, { quantity: newQuantity })
                    .subscribe({
                      next: (updatedBasketItem) => {
                        this.productService
                          .get(updatedBasketItem.ProductId)
                          .subscribe({
                            next: (product) => {
                              this.translateService
                                .get('BASKET_ADD_SAME_PRODUCT', {
                                  product: product.name
                                })
                                .subscribe({
                                  next: (basketAddSameProduct) => {
                                    this.snackBarHelperService.open(
                                      basketAddSameProduct,
                                      'confirmBar'
                                    )
                                    this.basketService.updateNumberOfCartItems()
                                  },
                                  error: (translationId) => {
                                    this.snackBarHelperService.open(
                                      translationId,
                                      'confirmBar'
                                    )
                                    this.basketService.updateNumberOfCartItems()
                                  }
                                })
                            },
                            error: (err) => {
                              console.log(err)
                            }
                          })
                      },
                      error: (err) => {
                        this.snackBarHelperService.open(
                          err.error?.error,
                          'errorBar'
                        )
                        console.log(err)
                      }
                    })
                },
                error: (err) => {
                  console.log(err)
                }
              })
            break
          }
        }
        if (!found) {
          this.basketService
            .save({
              ProductId: id,
              BasketId: sessionStorage.getItem('bid'),
              quantity: 1
            })
            .subscribe({
              next: (newBasketItem) => {
                this.productService.get(newBasketItem.ProductId).subscribe({
                  next: (product) => {
                    this.translateService
                      .get('BASKET_ADD_PRODUCT', { product: product.name })
                      .subscribe({
                        next: (basketAddProduct) => {
                          this.snackBarHelperService.open(
                            basketAddProduct,
                            'confirmBar'
                          )
                          this.basketService.updateNumberOfCartItems()
                        },
                        error: (translationId) => {
                          this.snackBarHelperService.open(
                            translationId,
                            'confirmBar'
                          )
                          this.basketService.updateNumberOfCartItems()
                        }
                      })
                  },
                  error: (err) => {
                    console.log(err)
                  }
                })
              },
              error: (err) => {
                this.snackBarHelperService.open(err.error?.error, 'errorBar')
                console.log(err)
              }
            })
        }
      },
      error: (err) => {
        console.log(err)
      }
    })
  }
}
