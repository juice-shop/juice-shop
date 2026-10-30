/*
 * PipelineFortress SEEDED VULNERABILITIES. Demo branch only, never merge.
 * Each marked line is a deliberate, well-known bug used to measure which stage catches it.
 */
import { type Request, type Response } from 'express'
import { exec } from 'node:child_process'
import * as models from '../models/index'

const PAYMENT_API_KEY = 'pf_live_NFpdMzixZ9dCQ2sM1jVaYktb3NS1HmCr' // SEED-4

export function pfReport () {
  return async (req: Request, res: Response) => {
    const [rows] = await models.sequelize.query(`SELECT * FROM Products WHERE name LIKE '%${String(req.query.q)}%'`) // SEED-1
    exec('ping -c 1 ' + String(req.query.host), () => {}) // SEED-2
    res.send('<h1>Report for ' + String(req.query.name) + '</h1>' + JSON.stringify(rows) + String(PAYMENT_API_KEY.length)) // SEED-3
  }
}
