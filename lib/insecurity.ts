/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import fs from "node:fs";
import crypto from "node:crypto";
import { type Request, type Response, type NextFunction } from "express";
import { type UserModel } from "models/user";
import expressJwt from "express-jwt";
import jwt from "jsonwebtoken";
import jws from "jws";
import sanitizeHtmlLib from "sanitize-html";
import sanitizeFilenameLib from "sanitize-filename";
import * as utils from "./utils";

/* jslint node: true */

// @ts-expect-error FIXME no typescript definitions for z85 :(
import * as z85 from "z85";

export const publicKey = fs ? fs.readFileSync("encryptionkeys/jwt.pub", "utf8") : "placeholder-public-key";
try {
  process.loadEnvFile();
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
    throw error;
  }
}

const privateKeyBase64 = process.env.JWT_PRIVATE_KEY_BASE64;
if (!privateKeyBase64) {
  throw new Error("JWT_PRIVATE_KEY_BASE64 is not configured");
}

const privateKey = Buffer.from(privateKeyBase64, "base64").toString("utf8");

interface ResponseWithUser {
  status?: string;
  data: UserModel;
  iat?: number;
  exp?: number;
  bid?: number;
}

interface IAuthenticatedUsers {
  tokenMap: Record<string, ResponseWithUser>;
  idMap: Record<string, string>;
  put: (token: string, user: ResponseWithUser) => void;
  get: (token?: string) => ResponseWithUser | undefined;
  delete: (teken?: string) => void;
  tokenOf: (user: UserModel) => string | undefined;
  from: (req: Request) => ResponseWithUser | undefined;
  updateFrom: (req: Request, user: ResponseWithUser) => any;
}

const revokedTokens = new Set<string>();
const normalizeToken = (token?: string) => (token ? utils.unquote(token) : undefined);
const tokenFromRequest = (req: Request) => utils.jwtFrom(req) || req.cookies?.token;

const scryptOptions = {
  N: 2 ** 17,
  r: 8,
  p: 1,
  maxmem: 256 * 1024 * 1024,
};

const passwordKeyLength = 64;

export const hashPassword = (password: string) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, passwordKeyLength, scryptOptions).toString("hex");

  return `scrypt$${salt}$${derivedKey}`;
};

export const verifyPassword = (password: string, storedPassword?: string) => {
  if (!storedPassword) {
    return false;
  }

  const [algorithm, salt, expectedHash] = storedPassword.split("$");

  if (algorithm !== "scrypt" || !salt || !expectedHash) {
    return false;
  }

  const actual = crypto.scryptSync(password, salt, passwordKeyLength, scryptOptions);
  const expected = Buffer.from(expectedHash, "hex");

  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
};

export const hash = (data: string) => crypto.createHash("md5").update(data).digest("hex");
export const hmac = (data: string) => crypto.createHmac("sha256", "pa4qacea4VK9t9nGv7yZtwmj").update(data).digest("hex");

export const isTokenRevoked = (token?: string) => {
  const normalizedToken = normalizeToken(token);
  return normalizedToken ? revokedTokens.has(normalizedToken) : false;
};

export const revokeToken = (token?: string) => {
  const normalizedToken = normalizeToken(token);
  if (normalizedToken) {
    revokedTokens.add(normalizedToken);
  }
};

export const cutOffPoisonNullByte = (str: string) => {
  const nullByte = "%00";
  if (utils.contains(str, nullByte)) {
    return str.substring(0, str.indexOf(nullByte));
  }
  return str;
};

export const isAuthorized = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = tokenFromRequest(req);
    if (!verify(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };
};

export const denyAll = () => expressJwt({ secret: "" + Math.random() } as any);
export const authorize = (user = {}) => jwt.sign(user, privateKey, { expiresInMinutes: 5, algorithm: "RS256" } as any);

export const verify = (token?: string) => {
  const normalizedToken = normalizeToken(token);
  if (!normalizedToken || isTokenRevoked(normalizedToken)) {
    return false;
  }

  const decodedToken = jws.decode(normalizedToken);
  const expiration = decodedToken?.payload?.exp;
  return (
    decodedToken?.header?.alg === "RS256" &&
    typeof expiration === "number" &&
    expiration > Math.floor(Date.now() / 1000) &&
    (jws.verify as (token: string, secret: string) => boolean)(normalizedToken, publicKey)
  );
};

export const decode = (token?: string): any => {
  const normalizedToken = normalizeToken(token);
  return normalizedToken && verify(normalizedToken) ? jws.decode(normalizedToken)?.payload : undefined;
};

export const sanitizeHtml = (html: string) => sanitizeHtmlLib(html);
export const sanitizeLegacy = (input = "") => input.replace(/<(?:\w+)\W+?[\w]/gi, "");
export const sanitizeFilename = (filename: string) => sanitizeFilenameLib(filename);
export const sanitizeSecure = (html: string): string => {
  const sanitized = sanitizeHtml(html);
  if (sanitized === html) {
    return html;
  } else {
    return sanitizeSecure(sanitized);
  }
};

export const authenticatedUsers: IAuthenticatedUsers = {
  tokenMap: {},
  idMap: {},
  put: function (token: string, user: ResponseWithUser) {
    const normalizedToken = normalizeToken(token);
    if (!normalizedToken) return;
    this.tokenMap[normalizedToken] = user;
    this.idMap[user.data.id] = normalizedToken;
  },
  get: function (token?: string) {
    const normalizedToken = normalizeToken(token);
    if (!normalizedToken || !verify(normalizedToken)) {
      if (normalizedToken) {
        this.delete(normalizedToken);
      }
      return undefined;
    }
    return this.tokenMap[normalizedToken];
  },
  delete: function (token?: string) {
    const normalizedToken = normalizeToken(token);
    if (!normalizedToken) return;

    const existingUser = this.tokenMap[normalizedToken];
    delete this.tokenMap[normalizedToken];

    if (existingUser?.data?.id && this.idMap[existingUser.data.id] === normalizedToken) {
      delete this.idMap[existingUser.data.id];
    }
  },
  tokenOf: function (user: UserModel) {
    return user ? this.idMap[user.id] : undefined;
  },
  from: function (req: Request) {
    const token = tokenFromRequest(req);
    return this.get(token);
  },
  updateFrom: function (req: Request, user: ResponseWithUser) {
    const token = tokenFromRequest(req);
    if (verify(token) && token) {
      this.put(token, user);
    }
  },
};

export const userEmailFrom = ({ headers }: any) => {
  return headers ? headers["x-user-email"] : undefined;
};

export const generateCoupon = (discount: number, date = new Date()) => {
  const coupon = utils.toMMMYY(date) + "-" + discount;
  return z85.encode(coupon);
};

export const discountFromCoupon = (coupon?: string) => {
  if (!coupon) {
    return undefined;
  }
  const decoded = z85.decode(coupon);
  if (decoded && hasValidFormat(decoded.toString()) != null) {
    const parts = decoded.toString().split("-");
    const validity = parts[0];
    if (utils.toMMMYY(new Date()) === validity) {
      const discount = parts[1];
      return parseInt(discount);
    }
  }
};

function hasValidFormat(coupon: string) {
  return coupon.match(/(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[0-9]{2}-[0-9]{2}/);
}

// vuln-code-snippet start redirectCryptoCurrencyChallenge redirectChallenge
export const redirectAllowlist = new Set([
  "https://github.com/juice-shop/juice-shop",
  "https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm", // vuln-code-snippet vuln-line redirectCryptoCurrencyChallenge
  "https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW", // vuln-code-snippet vuln-line redirectCryptoCurrencyChallenge
  "https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6", // vuln-code-snippet vuln-line redirectCryptoCurrencyChallenge
  "http://shop.spreadshirt.com/juiceshop",
  "http://shop.spreadshirt.de/juiceshop",
  "https://www.stickeryou.com/products/owasp-juice-shop/794",
  "http://leanpub.com/juice-shop",
]);

export const isRedirectAllowed = (url: string) => {
  let allowed = false;
  for (const allowedUrl of redirectAllowlist) {
    allowed = allowed || url.includes(allowedUrl); // vuln-code-snippet vuln-line redirectChallenge
  }
  return allowed;
};
// vuln-code-snippet end redirectCryptoCurrencyChallenge redirectChallenge

export const roles = {
  customer: "customer",
  deluxe: "deluxe",
  accounting: "accounting",
  admin: "admin",
};

export const deluxeToken = (email: string) => {
  const hmac = crypto.createHmac("sha256", privateKey);
  return hmac.update(email + roles.deluxe).digest("hex");
};

export const isAccounting = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = verify(utils.jwtFrom(req)) && decode(utils.jwtFrom(req));
    if (decodedToken?.data?.role === roles.accounting) {
      next();
    } else {
      res.status(403).json({ error: "Malicious activity detected" });
    }
  };
};

export const isDeluxe = (req: Request) => {
  const decodedToken = verify(utils.jwtFrom(req)) && decode(utils.jwtFrom(req));
  return decodedToken?.data?.role === roles.deluxe && decodedToken?.data?.deluxeToken && decodedToken?.data?.deluxeToken === deluxeToken(decodedToken?.data?.email);
};

export const isCustomer = (req: Request) => {
  const decodedToken = verify(utils.jwtFrom(req)) && decode(utils.jwtFrom(req));
  return decodedToken?.data?.role === roles.customer;
};

export const appendUserId = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = tokenFromRequest(req);
      if (!verify(token)) {
        return res.status(401).json({ status: "error", message: "Invalid token" });
      }
      const authenticatedUser = authenticatedUsers.get(token);
      if (!authenticatedUser) {
        return res.status(401).json({ status: "error", message: "user not authenticated" });
      }

      req.body.UserId = authenticatedUser.data.id;
      next();
    } catch (error: unknown) {
      res.status(401).json({ status: "error", message: utils.getErrorMessage(error) });
    }
  };
};

export const updateAuthenticatedUsers = () => (req: Request, res: Response, next: NextFunction) => {
  const token = tokenFromRequest(req);

  if (!token) {
    return next();
  }

  if (!verify(token)) {
    authenticatedUsers.delete(token);
    return next();
  }

  const decoded = decode(token);
  if (decoded && authenticatedUsers.tokenMap[normalizeToken(token) as string] === undefined) {
    authenticatedUsers.put(token, decoded);
    res.cookie("token", token);
  }

  next();
};

export const sanitizeUserForJwt = (user: any) => {
  const source = user.data?.dataValues ?? user.data ?? user;

  return {
    status: user.status,
    bid: user.bid,
    data: {
      id: source.id,
      username: source.username,
      email: source.email,
      role: source.role,
      deluxeToken: source.deluxeToken,
      lastLoginIp: source.lastLoginIp,
      profileImage: source.profileImage,
      isActive: source.isActive,
      createdAt: source.createdAt,
      updatedAt: source.updatedAt,
      deletedAt: source.deletedAt,
    },
  };
};
