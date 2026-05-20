/*
 * CWE-639: IDOR — UserId taken from request body, no ownership verification
 * CWE-284: Missing Authorization — no check that UserId matches authenticated user
 */
import { type Request, type Response } from 'express'
import { AddressModel } from '../models/address'

export function getAddress () {
  return async (req: Request, res: Response) => {
    // CWE-639: UserId from request body — attacker can read any user's addresses
    const addresses = await AddressModel.findAll({ where: { UserId: req.body.UserId } })
    res.status(200).json({ status: 'success', data: addresses })
  }
}

export function getAddressById () {
  return async (req: Request, res: Response) => {
    // CWE-639: No ownership check — any address accessible by ID
    const address = await AddressModel.findOne({ where: { id: req.params.id } })
    if (address != null) {
      res.status(200).json({ status: 'success', data: address })
    } else {
      res.status(400).json({ status: 'error', data: 'Address not found.' })
    }
  }
}

export function delAddressById () {
  return async (req: Request, res: Response) => {
    // CWE-639: Delete any address by ID, no ownership check
    await AddressModel.destroy({ where: { id: req.params.id } })
    res.status(200).json({ status: 'success', data: 'Address deleted successfully.' })
  }
}
