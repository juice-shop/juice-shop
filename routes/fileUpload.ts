/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import os from 'node:os';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import yaml from 'js-yaml';
import libxml from 'libxmljs';
import unzipper from 'unzipper';
import { type NextFunction, type Request, type Response } from 'express';
import multer from 'multer';
import * as challengeUtils from '../lib/challengeUtils';
import { challenges } from '../data/datacache';
import * as utils from '../lib/utils';

export const uploadToMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

export const uploadToDisk = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

export function ensureFileIsPassed({ file }: Request, res: Response, next: NextFunction): void {
  if (file != null) {
    next();
  } else {
    res.status(400).json({ error: 'File is not passed' });
  }
}

export function handleZipFileUpload({ file }: Request, res: Response, next: NextFunction): void {
  if (utils.endsWith(file?.originalname.toLowerCase(), '.zip')) {
    if (file?.buffer && utils.isChallengeEnabled(challenges.fileWriteChallenge)) {
      const buffer = file.buffer;
      const filename = file.originalname.toLowerCase();
      const tempFile = path.join(os.tmpdir(), filename);
      fs.open(tempFile, 'w', function (err, fd) {
        if (err) {
          next(err);
          return;
        }
        fs.write(fd, buffer, 0, buffer.length, null, function (err) {
          if (err) {
            next(err);
            return;
          }
          fs.close(fd, function () {
            fs.createReadStream(tempFile)
              .pipe(unzipper.Parse())
              .on('entry', function (entry: any) {
                const fileName = entry.path;
                const absolutePath = path.resolve('uploads/complaints/' + fileName);
                challengeUtils.solveIf(challenges.fileWriteChallenge, () => {
                  return absolutePath === path.resolve('ftp/legal.md');
                });
                if (absolutePath.includes(path.resolve('.'))) {
                  entry.pipe(
                    fs.createWriteStream('uploads/complaints/' + fileName).on('error', function (err) {
                      next(err);
                    })
                  );
                } else {
                  entry.autodrain();
                }
              })
              .on('error', function (err: unknown) {
                next(err);
              });
            next();
          });
        });
      });
    } else {
      next();
    }
  } else {
    next();
  }
}

export function checkUploadSize({ file }: Request, res: Response, next: NextFunction): void {
  if (file != null) {
    challengeUtils.solveIf(challenges.uploadSizeChallenge, () => {
      return file?.size > 100000;
    });
  }
  next();
}

export function checkFileType({ file }: Request, res: Response, next: NextFunction): void {
  const fileType = file?.originalname.substr(file.originalname.lastIndexOf('.') + 1).toLowerCase();
  challengeUtils.solveIf(challenges.uploadTypeChallenge, () => {
    return !(fileType === 'pdf' || fileType === 'xml' || fileType === 'zip' || fileType === 'yml' || fileType === 'yaml');
  });
  next();
}

export function handleXmlUpload({ file }: Request, res: Response, next: NextFunction): void {
  if (utils.endsWith(file?.originalname.toLowerCase(), '.xml')) {
    challengeUtils.solveIf(challenges.deprecatedInterfaceChallenge, () => {
      return true;
    });
    if (file?.buffer && utils.isChallengeEnabled(challenges.deprecatedInterfaceChallenge)) {
      const data = file.buffer.toString();
      try {
        const sandbox = { libxml, data };
        vm.createContext(sandbox);
        const xmlDoc = vm.runInContext('libxml.parseXml(data, { noblanks: true, noent: true, nocdata: true })', sandbox, { timeout: 2000 });
        const xmlString = xmlDoc.toString(false);
        challengeUtils.solveIf(challenges.xxeFileDisclosureChallenge, () => {
          return utils.matchesEtcPasswdFile(xmlString) || utils.matchesSystemIniFile(xmlString);
        });
        res.status(410).json({ error: 'B2B customer complaints via file upload have been deprecated for security reasons: ' + utils.trunc(xmlString, 400) + ' (' + file.originalname + ')' });
      } catch (err: any) {
        if (utils.contains(err.message, 'Script execution timed out')) {
          if (challengeUtils.notSolved(challenges.xxeDosChallenge)) {
            challengeUtils.solve(challenges.xxeDosChallenge);
          }
          res.status(503).json({ error: 'Sorry, we are temporarily not available! Please try again later.' });
        } else {
          res.status(410).json({ error: 'B2B customer complaints via file upload have been deprecated for security reasons: ' + err.message + ' (' + file.originalname + ')' });
        }
      }
    } else {
      res.status(410).json({ error: 'B2B customer complaints via file upload have been deprecated for security reasons (' + file?.originalname + ')' });
    }
  } else {
    next();
  }
}

export function handleYamlUpload({ file }: Request, res: Response, next: NextFunction): void {
  if (utils.endsWith(file?.originalname.toLowerCase(), '.yml') || utils.endsWith(file?.originalname.toLowerCase(), '.yaml')) {
    challengeUtils.solveIf(challenges.deprecatedInterfaceChallenge, () => {
      return true;
    });
    if (file?.buffer && utils.isChallengeEnabled(challenges.deprecatedInterfaceChallenge)) {
      const data = file.buffer.toString();
      try {
        const sandbox = { yaml, data };
        vm.createContext(sandbox);
        const yamlString = vm.runInContext('JSON.stringify(yaml.load(data))', sandbox, { timeout: 2000 });
        res.status(410).json({ error: 'B2B customer complaints via file upload have been deprecated for security reasons: ' + utils.trunc(yamlString, 400) + ' (' + file.originalname + ')' });
      } catch (err: any) {
        if (utils.contains(err.message, 'Invalid string length') || utils.contains(err.message, 'Script execution timed out')) {
          if (challengeUtils.notSolved(challenges.yamlBombChallenge)) {
            challengeUtils.solve(challenges.yamlBombChallenge);
          }
          res.status(503).json({ error: 'Sorry, we are temporarily not available! Please try again later.' });
        } else {
          res.status(410).json({ error: 'B2B customer complaints via file upload have been deprecated for security reasons: ' + err.message + ' (' + file.originalname + ')' });
        }
      }
    } else {
      res.status(410).json({ error: 'B2B customer complaints via file upload have been deprecated for security reasons (' + file?.originalname + ')' });
    }
  } else {
    res.status(204).end();
  }
}