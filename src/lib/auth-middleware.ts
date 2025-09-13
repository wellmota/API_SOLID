import { Request, Response, NextFunction } from 'express'
import { JWTService, JWTPayload } from './jwt'
import { UsersRepository } from '@/repositories/users-repository'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
  }
}

export class AuthMiddleware {
  constructor(
    private jwtService: JWTService,
    private usersRepository: UsersRepository,
  ) {}

  authenticate = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization
      const token = this.jwtService.extractTokenFromHeader(authHeader)

      if (!token) {
        res.status(401).json({ error: 'Token not provided' })
        return
      }

      if (this.jwtService.isTokenExpired(token)) {
        res.status(401).json({ error: 'Token expired' })
        return
      }

      const payload = this.jwtService.verifyToken(token)
      
      // Verify user still exists
      const user = await this.usersRepository.findById(payload.sub)
      if (!user) {
        res.status(401).json({ error: 'User not found' })
        return
      }

      req.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      }

      next()
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' })
    }
  }

  requireAdmin = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // First authenticate the user
      await this.authenticate(req, res, () => {})

      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' })
        return
      }

      if (req.user.role !== 'ADMIN') {
        res.status(403).json({ error: 'Admin access required' })
        return
      }

      next()
    } catch (error) {
      res.status(401).json({ error: 'Authentication failed' })
    }
  }

  optionalAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization
      const token = this.jwtService.extractTokenFromHeader(authHeader)

      if (!token) {
        // No token provided, continue without authentication
        next()
        return
      }

      if (this.jwtService.isTokenExpired(token)) {
        // Token expired, continue without authentication
        next()
        return
      }

      const payload = this.jwtService.verifyToken(token)
      
      // Verify user still exists
      const user = await this.usersRepository.findById(payload.sub)
      if (user) {
        req.user = {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
        }
      }

      next()
    } catch (error) {
      // Invalid token, continue without authentication
      next()
    }
  }
}
