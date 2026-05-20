/*
 * CWE-943: NoSQL Injection — user input in $where clause
 * CWE-79: Reflected XSS — order ID reflected in HTML response
 */
import { type Request, type Response } from 'express'
import * as db from '../data/mongodb'
import * as utils from '../lib/utils'

export function trackOrder () {
  return (req: Request, res: Response) => {
    const id = req.params.id

    // CWE-943: NoSQL Injection — id injected directly into $where operator
    db.ordersCollection.find({ $where: `this.orderId === '${id}'` }).then((order: any) => {
      const result = utils.queryResultToJson(order)
      if (result.data[0] === undefined) {
        // CWE-79: Reflected XSS — id echoed without encoding into message
        result.data[0] = { orderId: id, message: `No order found for <b>${id}</b>` }
      }
      res.json(result)
    }, () => {
      res.status(400).json({ error: `Invalid order ID: ${id}` })
    })
  }
}
