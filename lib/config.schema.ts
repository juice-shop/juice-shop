/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { z } from 'zod'
import { CHALLENGE_KEYS, type ChallengeKey } from '../models/challenge'

// -- Application sub-schemas --

const ChatBotSchema = z.object({
  name: z.string(),
  avatar: z.string(),
  model: z.string(),
  llmApiUrl: z.string(),
  llmMaxRetries: z.number().optional(),
  sampleQuestions: z.array(z.string()).optional()
})

const SocialSchema = z.object({
  twitterUrl: z.string(),
  facebookUrl: z.string(),
  slackUrl: z.string(),
  redditUrl: z.string(),
  pressKitUrl: z.string(),
  nftUrl: z.string().nullable(),
  questionnaireUrl: z.string().nullable(),
  blueSkyUrl: z.string().optional(),
  mastodonUrl: z.string().optional()
})

const RecyclePageSchema = z.object({
  topProductImage: z.string(),
  bottomProductImage: z.string()
})

const WelcomeBannerSchema = z.object({
  showOnFirstStart: z.boolean(),
  title: z.string(),
  message: z.string()
})

const CookieConsentSchema = z.object({
  message: z.string(),
  dismissText: z.string(),
  linkText: z.string(),
  linkUrl: z.string()
})

const SecurityTxtSchema = z.object({
  contact: z.string(),
  encryption: z.string(),
  acknowledgements: z.string(),
  hiring: z.string(),
  csaf: z.string()
})

const PromotionSchema = z.object({
  video: z.string(),
  subtitles: z.string()
})

const EasterEggPlanetSchema = z.object({
  name: z.string(),
  overlayMap: z.string()
})

const GoogleOauthSchema = z.object({
  clientId: z.string(),
  authorizedRedirects: z.array(z.object({ uri: z.string(), proxy: z.string().optional() }))
})

// -- Section schemas --

export const ServerSchema = z.object({
  port: z.number(),
  basePath: z.string(),
  baseUrl: z.string()
})

export const ApplicationSchema = z.object({
  domain: z.string(),
  name: z.string(),
  logo: z.string(),
  favicon: z.string(),
  theme: z.enum(['deeppurple-amber', 'indigo-pink', 'pink-bluegrey', 'purple-green', 'blue-lightblue', 'bluegrey-lightgreen', 'deeporange-indigo', 'lime-green', 'neon-fire']),
  showVersionNumber: z.boolean(),
  showGitHubLinks: z.boolean(),
  localBackupEnabled: z.boolean(),
  numberOfRandomFakeUsers: z.number(),
  altcoinName: z.string(),
  privacyContactEmail: z.string(),
  customMetricsPrefix: z.string(),
  chatBot: ChatBotSchema,
  social: SocialSchema,
  recyclePage: RecyclePageSchema,
  welcomeBanner: WelcomeBannerSchema,
  cookieConsent: CookieConsentSchema,
  securityTxt: SecurityTxtSchema,
  promotion: PromotionSchema,
  easterEggPlanet: EasterEggPlanetSchema,
  googleOauth: GoogleOauthSchema
})

export const ChallengesSchema = z.object({
  showSolvedNotifications: z.boolean(),
  showHints: z.boolean(),
  showMitigations: z.boolean(),
  codingChallengesEnabled: z.enum(['never', 'solved', 'always']),
  restrictToTutorialsFirst: z.boolean(),
  overwriteUrlForProductTamperingChallenge: z.string(),
  xssBonusPayload: z.string(),
  safetyMode: z.enum(['enabled', 'disabled', 'auto']).optional(),
  csafHashValue: z.string(),
  metricsIgnoredUserAgents: z.array(z.string()).optional()
})

export const HackingInstructorSchema = z.object({
  isEnabled: z.boolean(),
  avatarImage: z.string(),
  hintPlaybackSpeed: z.enum(['faster', 'fast', 'normal', 'slow', 'slower'])
})

export const ProductSchema = z.object({
  name: z.string(),
  price: z.number(),
  description: z.string(),
  image: z.string(),
  deluxePrice: z.number().optional(),
  limitPerUser: z.number().optional(),
  reviews: z.array(z.object({ text: z.string(), author: z.string() })).optional(),
  urlForProductTamperingChallenge: z.string().optional(),
  useForChristmasSpecialChallenge: z.boolean().optional(),
  keywordsForPastebinDataLeakChallenge: z.array(z.string()).optional(),
  deletedDate: z.string().optional(),
  quantity: z.number().optional(),
  fileForRetrieveBlueprintChallenge: z.string().optional(),
  exifForBlueprintChallenge: z.array(z.string()).optional()
})

export const MemorySchema = z.object({
  image: z.string(),
  caption: z.string(),
  user: z.string().optional(),
  geoStalkingMetaSecurityQuestion: z.number().optional(),
  geoStalkingMetaSecurityAnswer: z.string().optional(),
  geoStalkingVisualSecurityQuestion: z.number().optional(),
  geoStalkingVisualSecurityAnswer: z.string().optional()
})

// Challenge country mapping keyed by ChallengeKey.
export const ChallengeKeySchema = z.enum(CHALLENGE_KEYS as unknown as [ChallengeKey, ...ChallengeKey[]])
const CountryEntrySchema = z.object({ name: z.string(), code: z.string() })
export const CountryMappingSchema = z.record(ChallengeKeySchema, CountryEntrySchema)

export const CtfSchema = z.object({
  showFlagsInNotifications: z.boolean(),
  showCountryDetailsInNotifications: z.enum(['none', 'name', 'flag', 'both']),
  countryMapping: CountryMappingSchema.nullable().optional(),
  systemWideNotifications: z.object({
    url: z.string().nullable().optional(),
    pollFrequencySeconds: z.number().nullable().optional()
  }).optional()
})

export const AppConfigSchema = z.object({
  server: ServerSchema,
  application: ApplicationSchema,
  challenges: ChallengesSchema,
  hackingInstructor: HackingInstructorSchema,
  products: z.array(ProductSchema),
  memories: z.array(MemorySchema),
  ctf: CtfSchema
})

// Recursively drops null-valued object keys and null array elements.
// custom configs use null to signal that a value from the default.yml should be overwritten
const dropNulls = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.filter((entry) => entry != null).map(dropNulls)
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entry]) => entry != null)
        .map(([key, entry]) => [key, dropNulls(entry)])
    )
  }
  return value
}

// Deep-partial schema for validating possibly-incomplete individual YAML config files.
export const ValidationSchema = z.preprocess(dropNulls, z.object({
  server: ServerSchema.partial().optional(),
  application: ApplicationSchema.partial().extend({
    chatBot: ChatBotSchema.partial().optional(),
    social: SocialSchema.partial().optional(),
    recyclePage: RecyclePageSchema.partial().optional(),
    welcomeBanner: WelcomeBannerSchema.partial().optional(),
    cookieConsent: CookieConsentSchema.partial().optional(),
    securityTxt: SecurityTxtSchema.partial().optional(),
    promotion: PromotionSchema.partial().optional(),
    easterEggPlanet: EasterEggPlanetSchema.partial().optional(),
    googleOauth: GoogleOauthSchema.partial().optional()
  }).optional(),
  challenges: ChallengesSchema.partial().optional(),
  hackingInstructor: HackingInstructorSchema.partial().optional(),
  products: z.array(ProductSchema.partial()).optional(),
  memories: z.array(MemorySchema.partial()).optional(),
  ctf: CtfSchema.partial().optional()
}))

export type ServerConfig = z.infer<typeof ServerSchema>
export type ApplicationConfig = z.infer<typeof ApplicationSchema>
export type ChallengesConfig = z.infer<typeof ChallengesSchema>
export type HackingInstructorConfig = z.infer<typeof HackingInstructorSchema>
export type Product = z.infer<typeof ProductSchema>
export type Memory = z.infer<typeof MemorySchema>
export type CtfConfig = z.infer<typeof CtfSchema>
export type AppConfig = z.infer<typeof AppConfigSchema>
