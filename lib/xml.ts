/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Worker } from 'node:worker_threads'
import path from 'node:path'

// Parses XML with entity substitution and external entity loading enabled
// (intentionally vulnerable to XXE for the related challenges). The actual
// parsing runs in a dedicated worker thread (lib/xmlWorker.ts) which is
// forcibly terminated on timeout, so entity-expansion bombs surface as a
// "Script execution timed out" error instead of hanging the process. This
// avoids dynamic code execution APIs (e.g. vm.runInContext) entirely.
export async function parseXmlString (data: string, timeoutMs = 2000): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, 'xmlWorker.ts'), {
      workerData: { data },
      // Only forward the tsx loader (not the full process.execArgv, which under
      // e.g. the Node test runner also contains internal flags that Worker
      // rejects) so the worker can transpile this TypeScript file on the fly.
      execArgv: ['--import', 'tsx']
    })
    let settled = false

    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      void worker.terminate()
      reject(new Error('Script execution timed out'))
    }, timeoutMs)

    worker.once('message', (msg: { result?: string, error?: string }) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      void worker.terminate()
      if (msg.error != null) reject(new Error(msg.error))
      else resolve(msg.result ?? '')
    })

    worker.once('error', (err) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      reject(err)
    })
  })
}
