/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  try {
    res.render('data-erasure')
  } catch (err) {
    console.log(err)
  }
})

router.post('/', (req, res) => {
  const profile = req.body.profile
  res.render('data-erasure', profile)
})

module.exports = router
