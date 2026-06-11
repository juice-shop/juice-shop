/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import { ProductModel } from '../models/product'
import { BasketModel } from '../models/basket'
import * as challengeUtils from '../lib/challengeUtils'

import * as utils from '../lib/utils'
import * as security from '../lib/insecurity'
import { challenges } from '../data/datacache'

// [FIX-EV05] IDOR (CWE-639) - OWASP A01:2021 Broken Access Control
// Avant : le panier était récupéré uniquement par son ID URL, sans vérifier l'appartenance.
// Après : on récupère l'identité du user depuis le JWT (security.authenticatedUsers.from),
//         et on n'autorise que SON panier (UserId derive du token).
export function retrieveBasket () {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id

      // [FIX-EV05] Identité dérivée du token JWT (non falsifiable sans casser la signature)
      const user = security.authenticatedUsers.from(req)
      if (!user || !user.data || !user.data.id) {
        return res.status(401).json({ error: 'Authentication required' })
      }

      // [FIX-EV05] Recherche stricte : id du panier ET UserId = user authentifié
      const basket = await BasketModel.findOne({
        where: {
          id,
          UserId: user.data.id   // ← LA correction qui élimine l'IDOR
        },
        include: [{ model: ProductModel, paranoid: false, as: 'Products' }]
      })

      // [FIX-EV05] Si rien trouvé : panier inexistant OU appartient à un autre user
      // On retourne 404 dans les deux cas (évite de révéler l'existence d'un panier tiers)
      if (!basket) {
        console.warn(`IDOR attempt blocked: user ${user.data.id} tried to access basket ${id}`)
        return res.status(404).json({ error: 'Basket not found' })
      }

      // Conserve la logique de détection du challenge (sans changement de comportement)
      challengeUtils.solveIf(challenges.basketAccessChallenge, () => {
        return user && id && id !== 'undefined' && id !== 'null' && id !== 'NaN' && user.bid && user?.bid != parseInt(id, 10) // eslint-disable-line eqeqeq
      })

      if (((basket?.Products) != null) && basket.Products.length > 0) {
        for (let i = 0; i < basket.Products.length; i++) {
          basket.Products[i].name = req.__(basket.Products[i].name)
        }
      }

      res.json(utils.queryResultToJson(basket))
    } catch (error) {
      next(error)
    }
  }
}