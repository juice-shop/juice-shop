/*
 * INSECURE PRACTICE DEMONSTRATION - DO NOT USE IN PRODUCTION
 *
 * This file contains deliberately insecure API endpoint implementations 
 * for educational purposes. It demonstrates what NOT to do with sensitive credentials.
 */

import { Request, Response, NextFunction } from 'express'
import { insecureCredentials, initializeAWS, initializeGoogleAPI } from '../lib/insecureCredentials'

/**
 * API endpoint that returns AWS credentials (extremely bad practice)
 */
export function getAwsCredentials (_req: Request, res: Response) {
  res.status(200).json({
    message: 'WARNING: This endpoint exposes AWS credentials and is for demonstration purposes only',
    credentials: insecureCredentials.aws
  })
}

/**
 * API endpoint that returns Google credentials (extremely bad practice)
 */
export function getGoogleCredentials (_req: Request, res: Response) {
  res.status(200).json({
    message: 'WARNING: This endpoint exposes Google credentials and is for demonstration purposes only',
    credentials: insecureCredentials.google
  })
}

/**
 * Demo endpoint that shows AWS service initialization with hardcoded credentials
 */
export function demoAWSUsage (_req: Request, res: Response) {
  const awsService = initializeAWS()
  
  res.status(200).json({
    message: 'AWS client initialized with hardcoded credentials (DEMO)',
    clientInfo: {
      bucket: awsService.s3Client.bucket,
      // This is deliberately showing how credentials could be leaked in response data
      accessKeyIdFirstChars: awsService.s3Client.accessKeyId.substring(0, 10) + '...',
      secretAccessKeyPreview: awsService.s3Client.secretAccessKey.substring(0, 5) + '...'
    }
  })
}

/**
 * Demo endpoint that shows Google API initialization with hardcoded credentials
 */
export function demoGoogleAPIUsage (_req: Request, res: Response) {
  const googleService = initializeGoogleAPI()
  
  res.status(200).json({
    message: 'Google API initialized with hardcoded credentials (DEMO)',
    apiInfo: {
      // This is deliberately showing how credentials could be leaked in response data
      apiKeyPreview: googleService.apiKey.substring(0, 8) + '...',
      clientIdPreview: googleService.clientId.substring(0, 12) + '...'
    }
  })
}