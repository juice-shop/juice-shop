/*
 * INTENTIONALLY INSECURE - added for the DevSecOps pipeline assignment.
 *
 * SQL injection: untrusted request input is concatenated directly into a raw
 * SQL string. Detected by Semgrep (js-sql-injection custom rule) in the
 * Jenkins static-analysis stage.
 */

import { type Request, type Response, type NextFunction } from 'express'

import * as models from '../models/index'

export function insecureSearchProducts () {
  return (req: Request, res: Response, next: NextFunction) => {
    const query = (req.query.q ?? '') as string
    // Vulnerable: user input concatenated straight into the SQL statement.
    models.sequelize.query("SELECT * FROM Products WHERE ((name LIKE '%" + query + "%' OR description LIKE '%" + query + "%') AND deletedAt IS NULL) ORDER BY name")
      .then(([products]: any) => {
        res.json(products)
      }).catch((error: Error) => {
        next(error)
      })
  }
}
