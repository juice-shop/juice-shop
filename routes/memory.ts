/*
 * CWE-434: Unrestricted File Upload — no file type validation
 * CWE-639: IDOR — UserId taken from request body
 * CWE-22: Path Traversal — filename not sanitized
 */
import { type Request, type Response, type NextFunction } from 'express'
import { MemoryModel } from '../models/memory'
import { UserModel } from '../models/user'

export function addMemory () {
  return async (req: Request, res: Response, next: NextFunction) => {
    // CWE-22 + CWE-434: filename used directly without sanitization or type check
    const record = {
      caption: req.body.caption,
      imagePath: 'assets/public/images/uploads/' + req.file?.originalname,
      UserId: req.body.UserId  // CWE-639: IDOR
    }
    const memory = await MemoryModel.create(record)
    res.status(200).json({ status: 'success', data: memory })
  }
}

export function getMemories () {
  return async (req: Request, res: Response, next: NextFunction) => {
    // CWE-284: No auth check — returns all memories for all users
    const memories = await MemoryModel.findAll({ include: [UserModel] })
    res.status(200).json({ status: 'success', data: memories })
  }
}
