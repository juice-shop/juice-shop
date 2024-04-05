// manually typed definitions for the config file
// todo(@jannik.hollenbach) migrate the config schema to something which can automatically generate the types

export interface ServerConfig {
  port: number
  basePath: string
  baseUrl: string
}

export interface ApplicationConfig {
  domain: string
  name: string
  logo: string
  favicon: string
  theme: string
  showVersionNumber: boolean
  showGitHubLinks: boolean
  localBackupEnabled: boolean
  numberOfRandomFakeUsers: number
  altcoinName: string
  privacyContactEmail: string
  customMetricsPrefix: string
  chatBot: {
    name: string
    greeting: string
    trainingData: string
    defaultResponse: string
    avatar: string
  }
  social: {
    twitterUrl: string
    facebookUrl: string
    slackUrl: string
    redditUrl: string
    pressKitUrl: string
    nftUrl: string | null
    questionnaireUrl: string | null
  }
  recyclePage: {
    topProductImage: string
    bottomProductImage: string
  }
  welcomeBanner: {
    showOnFirstStart: boolean
    title: string
    message: string
  }
  cookieConsent: {
    message: string
    dismissText: string
    linkText: string
    linkUrl: string
  }
  securityTxt: {
    contact: string
    encryption: string
    acknowledgements: string
    hiring: string
    csaf: string
  }
  promotion: {
    video: string
    subtitles: string
  }
  easterEggPlanet: {
    name: string
    overlayMap: string
  }
  googleOauth: {
    clientId: string
    authorizedRedirects: Array<{ uri: string, proxy?: string }>
  }
}

export interface ChallengesConfig {
  showSolvedNotifications: boolean
  showHints: boolean
  showMitigations: boolean
  codingChallengesEnabled: 'never' | 'solved' | 'always'
  restrictToTutorialsFirst: boolean
  overwriteUrlForProductTamperingChallenge: string
  xssBonusPayload: string
  safetyOverride: boolean
  showFeedbackButtons: boolean
  csafHashValue: string
}

export interface HackingInstructorConfig {
  isEnabled: boolean
  avatarImage: string
  hintPlaybackSpeed: 'faster' | 'fast' | 'normal' | 'slow' | 'slower'
}

export interface Product {
  name: string
  price: number
  deluxePrice?: number
  limitPerUser?: number
  description: string
  image: string
  reviews?: Array<{ text: string, author: string }>
  urlForProductTamperingChallenge?: string
  useForChristmasSpecialChallenge?: boolean
  keywordsForPastebinDataLeakChallenge?: string[]
  deletedDate?: string
  quantity?: number
  fileForRetrieveBlueprintChallenge?: string
  exifForBlueprintChallenge?: string[]
}

export interface Memory {
  image: string
  caption: string
  user?: string
  geoStalkingMetaSecurityQuestion?: number
  geoStalkingMetaSecurityAnswer?: string
  geoStalkingVisualSecurityQuestion?: number
  geoStalkingVisualSecurityAnswer?: string
}

export interface CtfConfig {
  showFlagsInNotifications: boolean
  showCountryDetailsInNotifications: 'none' | 'name' | 'flag' | 'both'
  countryMapping: Record<string, {
    name: string
    code: string
  }>
}

export interface AppConfig {
  server: ServerConfig
  application: ApplicationConfig
  challenges: ChallengesConfig
  hackingInstructor: HackingInstructorConfig
  products: Product[]
  memories: Memory[]
  ctf: CtfConfig
}
