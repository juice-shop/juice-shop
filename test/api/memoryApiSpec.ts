/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import * as frisby from 'frisby'
import { expect } from '@jest/globals'
import config from 'config'
import path from 'node:path'
import fs from 'node:fs'

const jsonHeader = { 'content-type': 'application/json' }
const REST_URL = 'http://localhost:3000/rest'

describe('/rest/memories', () => {
  it('GET memories via public API', () => {
    return frisby.get(REST_URL + '/memories')
      .expect('status', 200)
  })

  it('GET memories via a valid authorization token', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'jim@' + config.get<string>('application.domain'),
        password: 'ncc-1701'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.get(REST_URL + '/memories', {
          headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' }
        })
          .expect('status', 200)
      })
  })

  it('POST new memory is forbidden via public API', () => {
    const file = path.resolve(__dirname, '../files/validProfileImage.jpg')
    const form = frisby.formData()
    form.append('image', fs.createReadStream(file) as unknown as Blob, 'Valid Image')// casting to blob as the frisby types are wrong and wont accept the fileStream type 'Valid Image')
    form.append('caption', 'Valid Image')

    return frisby.post(REST_URL + '/memories', {
      headers: {
        // @ts-expect-error FIXME form.getHeaders() is not found
        'Content-Type': form.getHeaders()['content-type']
      },
      body: form
    })
      .expect('status', 401)
  })

  it('POST new memory image file invalid type', () => {
    const file = path.resolve(__dirname, '../files/invalidProfileImageType.docx')
    const form = frisby.formData()
    form.append('image', fs.createReadStream(file) as unknown as Blob, 'Valid Image')// casting to blob as the frisby types are wrong and wont accept the fileStream type 'Valid Image')
    form.append('caption', 'Valid Image')

    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'jim@' + config.get<string>('application.domain'),
        password: 'ncc-1701'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.post(REST_URL + '/memories', {
          headers: {
            Authorization: 'Bearer ' + jsonLogin.authentication.token,
            // @ts-expect-error FIXME form.getHeaders() is not found
            'Content-Type': form.getHeaders()['content-type']
          },
          body: form
        })
          .expect('status', 500)
      })
  })

  it('POST new memory image file is not passed - 1', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'jim@' + config.get<string>('application.domain'),
        password: 'ncc-1701'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.post(REST_URL + '/memories', {
          headers: {
            Authorization: 'Bearer ' + jsonLogin.authentication.token
          }
        })
          .expect('status', 400)
          .expect('json', {
            error: 'File is not passed'
          })
      })
  })

  it('POST new memory image file is not passed - 2', () => {
    const form = frisby.formData()
    form.append('key1', 'value1')
    form.append('key2', 'value2')

    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'jim@' + config.get<string>('application.domain'),
        password: 'ncc-1701'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.post(REST_URL + '/memories', {
          headers: {
            Authorization: 'Bearer ' + jsonLogin.authentication.token,
            // @ts-expect-error FIXME form.getHeaders() is not found
            'Content-Type': form.getHeaders()['content-type']
          },
          body: form
        })
          .expect('status', 400)
          .expect('json', {
            error: 'File is not passed'
          })
      })
  })

  it('POST new memory with valid for JPG format image', () => {
    const file = path.resolve(__dirname, '../files/validProfileImage.jpg')
    const form = frisby.formData()
    form.append('image', fs.createReadStream(file) as unknown as Blob, 'Valid Image')// casting to blob as the frisby types are wrong and wont accept the fileStream type 'Valid Image')
    form.append('caption', 'Valid Image')

    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'jim@' + config.get<string>('application.domain'),
        password: 'ncc-1701'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.post(REST_URL + '/memories', {
          headers: {
            Authorization: 'Bearer ' + jsonLogin.authentication.token,
            // @ts-expect-error FIXME form.getHeaders() is not found
            'Content-Type': form.getHeaders()['content-type']
          },
          body: form
        })
          .expect('status', 200)
          .then(({ json }) => {
            expect(json.data.caption).toBe('Valid Image')
            expect(json.data.UserId).toBe(2)
          })
      })
  })

  it('Should not crash the node-js server when sending invalid content like described in CVE-2022-24434', () => {
    return frisby.post(REST_URL + '/memories', {
      headers: {
        'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundaryoo6vortfDzBsDiro',
        'Content-Length': '145'
      },
      body: '------WebKitFormBoundaryoo6vortfDzBsDiro\r\n Content-Disposition: form-data; name="bildbeschreibung"\r\n\r\n\r\n------WebKitFormBoundaryoo6vortfDzBsDiro--'
    })
      .expect('status', 500)
      .expect('bodyContains', 'Error: Malformed part header')
  })
})
