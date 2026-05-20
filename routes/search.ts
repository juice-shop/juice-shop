/*
 * CWE-89: SQL Injection — search criteria concatenated into query
 * CWE-79: Reflected XSS — criteria echoed back in JSON response without sanitization
 */
import { type Request, type Response, type NextFunction } from 'express'
import * as models from '../models/index'
import * as utils from '../lib/utils'

class ErrorWithParent extends Error {
  parent: Error | undefined
}

export function searchProducts () {
  return (req: Request, res: Response, next: NextFunction) => {
    // CWE-89: No input sanitization — direct string concatenation into SQL
    const criteria: any = req.query.q ?? ''

    // CWE-89: SQL Injection via UNION attack possible
    models.sequelize.query(
      `SELECT * FROM Products WHERE ((name LIKE '%${criteria}%' OR description LIKE '%${criteria}%') AND deletedAt IS NULL) ORDER BY name`
    ).then(([products]: any) => {
      // CWE-79: User-controlled criteria reflected in response without encoding
      res.json({ ...utils.queryResultToJson(products), searchTerm: criteria })
    }).catch((error: ErrorWithParent) => {
      next(error.parent)
    })
  }
}
