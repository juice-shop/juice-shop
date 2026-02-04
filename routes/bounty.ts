/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import { ChallengeModel } from '../models/challenge'
import { BountyModel } from '../models/bounty'
import { WalletModel } from '../models/wallet'

export function claimBounty() {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const activeChallenges = await ChallengeModel.findAll({ where: { solved: true } })
            const claimedBounties = await BountyModel.findAll({ where: { UserId: req.body.UserId } })

            const claimedKeys = new Set(claimedBounties.map(b => b.challengeKey))
            let totalReward = 0
            const newClaims: string[] = []

            for (const challenge of activeChallenges) {
                if (!claimedKeys.has(challenge.key)) {
                    // Calculate reward: Difficulty * 100 (example)
                    const reward = challenge.difficulty * 100
                    totalReward += reward
                    newClaims.push(challenge.key)

                    await BountyModel.create({
                        UserId: req.body.UserId,
                        challengeKey: challenge.key
                    })
                }
            }

            if (totalReward > 0) {
                await WalletModel.increment({ balance: totalReward }, { where: { UserId: req.body.UserId } })
            }

            const updatedWallet = await WalletModel.findOne({ where: { UserId: req.body.UserId } })

            res.status(200).json({
                status: 'success',
                data: {
                    newClaims,
                    totalReward,
                    walletBalance: updatedWallet ? updatedWallet.balance : 0
                }
            })
        } catch (err) {
            console.error(err)
            res.status(500).json({ status: 'error', message: 'Failed to claim bounty.' })
        }
    }
}

export function getBountyStatus() {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const solvedChallenges = await ChallengeModel.findAll({ where: { solved: true } })
            const claimedBounties = await BountyModel.findAll({ where: { UserId: req.body.UserId } })
            const claimedKeys = new Set(claimedBounties.map(b => b.challengeKey))

            const status = solvedChallenges.map(c => ({
                key: c.key,
                name: c.name,
                difficulty: c.difficulty,
                reward: c.difficulty * 100,
                claimed: claimedKeys.has(c.key)
            }))

            res.status(200).json({ status: 'success', data: status })
        } catch (err) {
            res.status(500).json({ status: 'error' })
        }
    }
}
