/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config from 'config'
import { type Request, type Response } from 'express'

import * as utils from '../lib/utils'

module.exports = function retrieveAppVersion () {
  return (_req: Request, res: Response) => {
    // res.json({
    //   version: config.get('application.showVersionNumber') ? utils.version() : ''
    // })
    const version = config.get('application.showVersionNumber') ? utils.version() : '';
    const userInput = _req.query.input || ''; // Adding a user input from query parameter

    // Introducing XSS vulnerability by directly reflecting user input
    res.send(`
      <html>
        <body>
          <h1>App Version: ${version}</h1>
          <div>User Input: ${userInput}</div> <!-- XSS vulnerability here -->
        </body>
      </html>`)
  }
}


// module.exports = function retrieveAppVersion () {
//   return (req, res) => {

//     `);
//   }
// }