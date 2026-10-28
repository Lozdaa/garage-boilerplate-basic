import type { Request, Response, NextFunction } from 'express'
import { HttpError } from '../lib/errors'

/**
 * Pendants can't log in like a user, so each request carries a shared secret
 * in the `x-device-key` header. It must match DEVICE_API_KEY on the server.
 */
export function deviceAuth(req: Request, _res: Response, next: NextFunction): void {
  const expected = process.env.DEVICE_API_KEY

  // Fail closed: if the server has no key configured, let NOBODY in
  if (!expected) {
    next(HttpError.internal('Device authentication is not configured'))
    return
  }

  if (req.header('x-device-key') !== expected) {
    next(HttpError.unauthorized('Missing or invalid device key'))
    return
  }

  next() // key matches, so carry on to the route
}