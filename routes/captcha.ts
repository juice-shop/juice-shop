/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import { CaptchaModel } from '../models/captcha'

export function captchas () {
  return async (req: Request, res: Response) => {
    const captchaId = req.app.locals.captchaId++
    const operators = ['*', '+', '-']

    const firstTerm = Math.floor((Math.random() * 10) + 1)
    const secondTerm = Math.floor((Math.random() * 10) + 1)
    const thirdTerm = Math.floor((Math.random() * 10) + 1)

    const firstOperator = operators[Math.floor((Math.random() * 3))]
    const secondOperator = operators[Math.floor((Math.random() * 3))]

    const expression = firstTerm.toString() + firstOperator + secondTerm.toString() + secondOperator + thirdTerm.toString()
    // без eval
    const answer = evaluate_captcha_expression(firstTerm, firstOperator, secondTerm, secondOperator, thirdTerm).toString()

    const captcha = {
      captchaId,
      captcha: expression,
      answer
    }
    const captchaInstance = CaptchaModel.build(captcha)
    await captchaInstance.save()
    res.json(captcha)
  }
}

export const verifyCaptcha = () => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const captcha = await CaptchaModel.findOne({ where: { captchaId: req.body.captchaId } })
    if ((captcha != null) && req.body.captcha === captcha.answer) {
      next()
    } else {
      res.status(401).send(res.__('Wrong answer to CAPTCHA. Please try again.'))
    }
  } catch (error) {
    next(error)
  }
}

function evaluate_captcha_expression (
  first_term: number,
  first_op: string,
  second_term: number,
  second_op: string,
  third_term: number
): number {
  const bin = (x: number, op: string, y: number) => (op === '+' ? x + y : op === '-' ? x - y : x * y)
  if (second_op === '*') return bin(first_term, first_op, bin(second_term, second_op, third_term))
  if (first_op === '*') return bin(bin(first_term, first_op, second_term), second_op, third_term)
  return bin(bin(first_term, first_op, second_term), second_op, third_term)
}
