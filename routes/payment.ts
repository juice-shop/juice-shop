/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Request, Response, NextFunction } from 'express'
import CardModel from 'models/card'

interface displayCard{
  UserId: number;
  id: number;
  fullName: string;
  cardNum: string;
  expMonth: number;
  expYear: number;
}

module.exports.getPaymentMethods = function getPaymentMethods () {
  return async (req: Request, res: Response, next: NextFunction) => {
    let displayableCards:Array<displayCard>=[];
    const cards = await CardModel.findAll({ where: { UserId: req.body.UserId } })
    cards.forEach(card => {
      let displayableCard:displayCard={
        UserId:card.UserId,
        id:card.id,
        fullName:card.fullName,
        cardNum:"",
        expMonth:card.expMonth,
        expYear:card.expYear
      };
      const cardNumber = String(card.cardNum)
      displayableCard.cardNum = '*'.repeat(12) + cardNumber.substring(cardNumber.length - 4)
      displayableCards.push(displayableCard)
    })
    res.status(200).json({ status: 'success', data: displayableCards })
  }
}

module.exports.getPaymentMethodById = function getPaymentMethodById () {
  return async (req: Request, res: Response, next: NextFunction) => {
    const card = await CardModel.findOne({ where: { id: req.params.id, UserId: req.body.UserId } })
    let displayableCard:displayCard={
      UserId:0,
      id:0,
      fullName:"",
      cardNum:"",
      expMonth:0,
      expYear:0
    };
    if (card) {
        displayableCard.UserId=card.UserId
        displayableCard.id=card.id
        displayableCard.fullName=card.fullName
        displayableCard.expMonth=card.expMonth
        displayableCard.expYear=card.expYear

        const cardNumber = String(card.cardNum)
        displayableCard.cardNum = '*'.repeat(12) + cardNumber.substring(cardNumber.length - 4)  
      }
    if (card && displayableCard) {
      res.status(200).json({ status: 'success', data: displayableCard })
    } else {
      res.status(400).json({ status: 'error', data: 'Malicious activity detected' })
    }
  }
}

module.exports.delPaymentMethodById = function delPaymentMethodById () {
  return async (req: Request, res: Response, next: NextFunction) => {
    const card = await CardModel.destroy({ where: { id: req.params.id, UserId: req.body.UserId } })
    if (card) {
      res.status(200).json({ status: 'success', data: 'Card deleted successfully.' })
    } else {
      res.status(400).json({ status: 'error', data: 'Malicious activity detected.' })
    }
  }
}
