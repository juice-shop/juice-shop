/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import vm from 'node:vm'

// libxml2-wasm is ESM-only and uses top-level await, so it can neither be
// statically imported nor require()'d from the CommonJS build output. The
// Function wrapper keeps this a native dynamic import() that tsc won't rewrite.
// eslint-disable-next-line no-new-func -- intentional: hides import() from tsc's CommonJS down-level transform
const dynamicImport = new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<any>
let libxml2Promise: Promise<any> | undefined

async function loadLibxml2 () {
  if (libxml2Promise == null) {
    libxml2Promise = (async () => {
      const libxml2 = await dynamicImport('libxml2-wasm')
      // Grants the WASM sandbox host filesystem access so external entities
      // like file:///etc/passwd resolve - required for the XXE challenges.
      const { xmlRegisterFsInputProviders } = await dynamicImport('libxml2-wasm/lib/nodejs.mjs')
      xmlRegisterFsInputProviders()
      return libxml2
    })()
  }
  return await libxml2Promise
}

// Parses XML with entity substitution and external entity loading enabled
// (intentionally vulnerable to XXE for the related challenges). The parse runs
// in a vm context with a timeout so entity-expansion bombs surface as a
// "Script execution timed out" error instead of hanging the process.
export async function parseXmlString (data: string, timeoutMs = 2000): Promise<string> {
  const libxml2 = await loadLibxml2()
  const option = libxml2.ParseOption.XML_PARSE_NOENT | libxml2.ParseOption.XML_PARSE_DTDLOAD | libxml2.ParseOption.XML_PARSE_NOBLANKS | libxml2.ParseOption.XML_PARSE_NOCDATA
  const sandbox = { libxml2, data, option }
  vm.createContext(sandbox)
  const xmlDoc = vm.runInContext('libxml2.XmlDocument.fromString(data, { option })', sandbox, { timeout: timeoutMs })
  const xmlString = xmlDoc.toString()
  xmlDoc.dispose()
  return xmlString
}
