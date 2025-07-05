/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import fs from 'node:fs/promises';
import { type Request, type Response, type NextFunction } from 'express';
import { fileTypeFromBuffer } from 'file-type/core'; // Use explicit core import
import logger from '../lib/logger';
import * as utils from '../lib/utils';
import { UserModel } from '../models/user';
import * as security from '../lib/insecurity';

export function profileImageFileUpload() {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const file = req.file;
    const buffer = file?.buffer;
    if (buffer === undefined) {
      res.status(500).json({ error: 'Illegal file type' });
      return;
    }
    const uploadedFileType = await fileTypeFromBuffer(buffer);
    if (uploadedFileType === undefined) {
      res.status(500).json({ error: 'Illegal file type' });
      return;
    }
    if (!uploadedFileType.mime.startsWith('image')) {
      res.status(415).json({ error: `Profile image upload does not accept this file type: ${uploadedFileType.mime}` });
      return;
    }
    const loggedInUser = security.authenticatedUsers.get(req.cookies.token);
    if (!loggedInUser) {
      res.status(401).json({ error: 'Blocked illegal activity by ' + req.socket.remoteAddress });
      return;
    }

    const filePath = `frontend/dist/frontend/assets/public/images/uploads/${loggedInUser.data.id}.${uploadedFileType.ext}`;
    try {
      await fs.writeFile(filePath, buffer);
      const user = await UserModel.findByPk(loggedInUser.data.id);
      if (user) {
        await user.update({ profileImage: `assets/public/images/uploads/${loggedInUser.data.id}.${uploadedFileType.ext}` });
        res.location(process.env.BASE_PATH + '/profile');
        res.redirect(process.env.BASE_PATH + '/profile');
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (err) {
      logger.warn('Error writing file: ' + (err instanceof Error ? err.message : String(err)));
      next(err);
    }
  };
}