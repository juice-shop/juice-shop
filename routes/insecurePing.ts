/*
 * INTENTIONALLY INSECURE - added for the DevSecOps pipeline assignment.
 *
 * OS command injection: untrusted request input is passed to a shell command
 * via child_process.exec. Detected by Semgrep (js-command-injection custom
 * rule) and njsscan in the Jenkins static-analysis stage.
 */

import { type Request, type Response } from 'express'
import { exec } from 'child_process'

export function insecurePing () {
  return (req: Request, res: Response) => {
    const host = (req.query.host ?? '127.0.0.1') as string
    // Vulnerable: unsanitised user input interpolated into a shell command.
    exec('ping -c 1 ' + host, (error, stdout, stderr) => {
      if (error != null) {
        res.status(500).type('text/plain').send(stderr)
        return
      }
      res.type('text/plain').send(stdout)
    })
  }
}
