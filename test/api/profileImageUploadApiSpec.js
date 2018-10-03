const frisby = require('frisby')
const fs = require('fs')
const path = require('path')
const FormData = require('form-data')
const utils = require('../../lib/utils')

const URL = 'http://localhost:3000'

describe.only('/profile/image/file', () => {
  let form;
  let file;

  it('POST valid file works', done => {
    file = path.resolve(__dirname, `../files/image_small.png`);
    form = new FormData()
    form.append('file', fs.createReadStream(file))

    frisby
        .post(URL + '/profile/image/file', {
        headers: form.getHeaders(),
        body: form,
      })
      .expect('status', 200)
      .done(done);
  });
});
