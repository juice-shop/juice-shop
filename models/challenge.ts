/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
import {
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  DataTypes,
  type CreationOptional,
  type Sequelize
} from 'sequelize'

const CHALLENGE_KEYS = [
  'restfulXssChallenge',
  'accessLogDisclosureChallenge',
  'registerAdminChallenge',
  'adminSectionChallenge',
  'fileWriteChallenge',
  'resetPasswordBjoernOwaspChallenge',
  'tokenSaleChallenge',
  'nftUnlockChallenge',
  'nftMintChallenge',
  'web3WalletChallenge',
  'web3SandboxChallenge',
  'rceChallenge',
  'captchaBypassChallenge',
  'changePasswordBenderChallenge',
  'christmasSpecialChallenge',
  'usernameXssChallenge',
  'persistedXssUserChallenge',
  'directoryListingChallenge',
  'localXssChallenge',
  'dbSchemaChallenge',
  'deprecatedInterfaceChallenge',
  'easterEggLevelOneChallenge',
  'emailLeakChallenge',
  'emptyUserRegistration',
  'ephemeralAccountantChallenge',
  'errorHandlingChallenge',
  'manipulateClockChallenge',
  'extraLanguageChallenge',
  'feedbackChallenge',
  'forgedCouponChallenge',
  'forgedFeedbackChallenge',
  'forgedReviewChallenge',
  'jwtForgedChallenge',
  'forgottenDevBackupChallenge',
  'forgottenBackupChallenge',
  'typosquattingAngularChallenge',
  'ghostLoginChallenge',
  'dataExportChallenge',
  'httpHeaderXssChallenge',
  'continueCodeChallenge',
  'dlpPasswordSprayingChallenge',
  'dlpPastebinDataLeakChallenge',
  'typosquattingNpmChallenge',
  'loginAdminChallenge',
  'loginAmyChallenge',
  'loginBenderChallenge',
  'oauthUserPasswordChallenge',
  'loginJimChallenge',
  'loginRapperChallenge',
  'loginSupportChallenge',
  'basketManipulateChallenge',
  'misplacedSignatureFileChallenge',
  'timingAttackChallenge',
  'easterEggLevelTwoChallenge',
  'noSqlCommandChallenge',
  'noSqlOrdersChallenge',
  'noSqlReviewsChallenge',
  'redirectCryptoCurrencyChallenge',
  'weakPasswordChallenge',
  'negativeOrderChallenge',
  'premiumPaywallChallenge',
  'privacyPolicyChallenge',
  'privacyPolicyProofChallenge',
  'changeProductChallenge',
  'reflectedXssChallenge',
  'passwordRepeatChallenge',
  'resetPasswordBenderChallenge',
  'resetPasswordBjoernChallenge',
  'resetPasswordJimChallenge',
  'resetPasswordMortyChallenge',
  'retrieveBlueprintChallenge',
  'ssrfChallenge',
  'sstiChallenge',
  'scoreBoardChallenge',
  'securityPolicyChallenge',
  'persistedXssFeedbackChallenge',
  'hiddenImageChallenge',
  'rceOccupyChallenge',
  'supplyChainAttackChallenge',
  'twoFactorAuthUnsafeSecretStorageChallenge',
  'jwtUnsignedChallenge',
  'uploadSizeChallenge',
  'uploadTypeChallenge',
  'unionSqlInjectionChallenge',
  'videoXssChallenge',
  'basketAccessChallenge',
  'knownVulnerableComponentChallenge',
  'weirdCryptoChallenge',
  'redirectChallenge',
  'xxeFileDisclosureChallenge',
  'xxeDosChallenge',
  'yamlBombChallenge',
  'zeroStarsChallenge',
  'missingEncodingChallenge',
  'svgInjectionChallenge',
  'exposedMetricsChallenge',
  'freeDeluxeChallenge',
  'csrfChallenge',
  'xssBonusChallenge',
  'resetPasswordUvoginChallenge',
  'geoStalkingMetaChallenge',
  'geoStalkingVisualChallenge',
  'killChatbotChallenge',
  'nullByteChallenge',
  'bullyChatbotChallenge',
  'lfrChallenge',
  'closeNotificationsChallenge',
  'csafChallenge',
  'exposedCredentialsChallenge',
  'leakedApiKeyChallenge'
] as const

export type ChallengeKey = typeof CHALLENGE_KEYS[number]

class Challenge extends Model<
InferAttributes<Challenge>,
InferCreationAttributes<Challenge>
> {
  declare id: CreationOptional<number>
  declare name: string
  declare category: string
  declare description: string
  declare difficulty: number
  declare mitigationUrl: CreationOptional<string> | null
  declare key: ChallengeKey
  declare disabledEnv: CreationOptional<string> | null
  declare tutorialOrder: CreationOptional<number> | null
  declare tags: string | undefined
  declare solved: CreationOptional<boolean>
  declare codingChallengeStatus: CreationOptional<number>
  declare hasCodingChallenge: boolean
}

const ChallengeModelInit = (sequelize: Sequelize) => {
  Challenge.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      key: {
        type: DataTypes.ENUM,
        values: CHALLENGE_KEYS
      },
      name: DataTypes.STRING,
      category: DataTypes.STRING,
      tags: DataTypes.STRING,
      description: DataTypes.STRING,
      difficulty: DataTypes.INTEGER,
      mitigationUrl: DataTypes.STRING,
      solved: DataTypes.BOOLEAN,
      disabledEnv: DataTypes.STRING,
      tutorialOrder: DataTypes.NUMBER,
      codingChallengeStatus: DataTypes.NUMBER,
      hasCodingChallenge: DataTypes.BOOLEAN
    },
    {
      tableName: 'Challenges',
      sequelize
    }
  )
}

export { Challenge as ChallengeModel, ChallengeModelInit }
