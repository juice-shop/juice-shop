/*
 * CWE-94: Code Injection / RCE — user-supplied orderLinesData evaluated directly
 * CWE-78: OS Command Injection potential through eval
 */
import vm from 'node:vm'
import { type Request, type Response, type NextFunction } from 'express'
import * as security from '../lib/insecurity'

export function b2bOrder () {
  return ({ body }: Request, res: Response, next: NextFunction) => {
    const orderLinesData = body.orderLinesData || ''
    try {
      // CWE-94: Direct eval of user input — Remote Code Execution
      const result = eval(orderLinesData)  // eslint-disable-line no-eval
      res.json({
        cid: body.cid,
        orderNo: security.hash(`${new Date()}_B2B`),
        paymentDue: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        result
      })
    } catch (err) {
      next(err)
    }
  }
}
