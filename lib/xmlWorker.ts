/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { parentPort, workerData } from 'node:worker_threads'

// libxml2-wasm is ESM-only and uses top-level await, so it can neither be
// statically imported nor require()'d from the CommonJS build output. The
// Function wrapper keeps this a native dynamic import() that tsc won't rewrite.
// eslint-disable-next-line no-new-func -- intentional: hides import() from tsc's CommonJS down-level transform
const dynamicImport = new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<any>

// Runs the actual XML parsing on this dedicated worker thread so the parent
// thread can enforce a hard timeout via worker.terminate() (see lib/xml.ts),
// without relying on dynamic code execution APIs like vm.runInContext.
async function run (): Promise<void> {
  try {
    const libxml2 = await dynamicImport('libxml2-wasm')
    // Grants the WASM sandbox host filesystem access so external entities
    // like file:///etc/passwd resolve - required for the XXE challenges.
    const { xmlRegisterFsInputProviders } = await dynamicImport('libxml2-wasm/lib/nodejs.mjs')
    xmlRegisterFsInputProviders()

    const option = libxml2.ParseOption.XML_PARSE_NOENT | libxml2.ParseOption.XML_PARSE_DTDLOAD | libxml2.ParseOption.XML_PARSE_NOBLANKS | libxml2.ParseOption.XML_PARSE_NOCDATA
    const xmlDoc = libxml2.XmlDocument.fromString(workerData.data, { option })
    const xmlString = xmlDoc.toString()
    xmlDoc.dispose()
    parentPort?.postMessage({ result: xmlString })
  } catch (err: any) {
    parentPort?.postMessage({ error: err?.message ?? String(err) })
  }
}

void run()
