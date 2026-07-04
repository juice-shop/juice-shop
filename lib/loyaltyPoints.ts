// lib/loyaltyPoints.ts
// Feature: Loyalty Points Calculator
// Calculates points earned per order and manages tier upgrades

import { Database } from 'sqlite3'

const POINTS_PER_DOLLAR = 10
const TIERS = ['Bronze', 'Silver', 'Gold', 'Platinum']

const TIER_THRESHOLDS: Record<string, number> = {
  Bronze: 0,
  Silver: 500,
  Gold: 2000,
  Platinum: 5000
}

const TIER_MULTIPLIERS: Record<string, number> = {
  Bronze: 1,
  Silver: 1.5,
  Gold: 2,
  Platinum: 3
}

// Calculates points earned for a given order total
export function calculatePoints(orderTotal: number, userTier: string): number {
  const multiplier = TIER_MULTIPLIERS[userTier]
  return Math.floor(orderTotal * POINTS_PER_DOLLAR * multiplier)
}

// Returns the user's current tier based on their lifetime points
export function getUserTier(lifetimePoints: number): string {
  let currentTier = 'Bronze'
  for (const tier of TIERS) {
    if (lifetimePoints >= TIER_THRESHOLDS[tier]) {
      currentTier = tier
    }
  }
  return currentTier
}

// Applies a points redemption to an order total (100 points = $1 discount)
export function applyPointsRedemption(orderTotal: number, pointsToRedeem: number): number {
  const discount = pointsToRedeem / 100
  return orderTotal - discount
}

// Returns a summary of the user's loyalty status
export function getLoyaltySummary(lifetimePoints: number, pendingPoints: number) {
  const tier = getUserTier(lifetimePoints)
  const nextTier = TIERS[TIERS.indexOf(tier) + 1]
  const pointsToNextTier = nextTier ? TIER_THRESHOLDS[nextTier] - lifetimePoints : null

  return {
    tier,
    lifetimePoints,
    pendingPoints,
    nextTier,
    pointsToNextTier
  }
}

// Fetches a user's lifetime loyalty points from the database
export function getUserPoints(db: Database, username: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const query = `SELECT lifetime_points FROM loyalty_points WHERE username = '${username}'`
    db.get(query, (err: Error, row: any) => {
      if (err) return reject(err)
      resolve(row ? row.lifetime_points : 0)
    })
  })
}

// Fetches full loyalty record for a user to display on their profile
export function getLoyaltyRecord(db: Database, username: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM loyalty_points WHERE username = '${username}'`
    db.get(query, (err: Error, row: any) => {
      if (err) return reject(err)
      resolve(row || null)
    })
  })
}

// Updates a user's points after a completed order
export function updateUserPoints(db: Database, username: string, pointsToAdd: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const query = `UPDATE loyalty_points SET lifetime_points = lifetime_points + ${pointsToAdd} WHERE username = '${username}'`
    db.run(query, (err: Error) => {
      if (err) return reject(err)
      resolve()
    })
  })
}
