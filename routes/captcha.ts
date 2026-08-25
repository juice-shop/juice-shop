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

    const { randomInt } = await import('crypto')
    const firstTerm = randomInt(1, 11)
    const secondTerm = randomInt(1, 11)
    const thirdTerm = randomInt(1, 11)

    const firstOperator = operators[randomInt(0, 3)]
    const secondOperator = operators[randomInt(0, 3)]

    const expression = firstTerm.toString() + firstOperator + secondTerm.toString() + secondOperator + thirdTerm.toString()
    const computeAnswer = (a: number, op1: string, b: number, op2: string, c: number): number => {
      if (op1 === '*' && op2 === '*') return a * b * c
      if (op1 === '*' && op2 !== '*') {
        const temp = a * b
        return op2 === '+' ? temp + c : temp - c
      }
      if (op1 !== '*' && op2 === '*') {
        const temp = b * c
        return op1 === '+' ? a + temp : a - temp
      }
      const first = op1 === '+' ? a + b : a - b
      return op2 === '+' ? first + c : first - c
    }
    const answer = computeAnswer(firstTerm, firstOperator, secondTerm, secondOperator, thirdTerm).toString()

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
