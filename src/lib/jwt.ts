export interface JWTPayload {
  sub: string // user id
  email: string
  role: string
  iat?: number
  exp?: number
}

export class JWTService {
  private readonly secret: string
  private readonly expiresIn: string

  constructor(secret: string, expiresIn: string = '7d') {
    this.secret = secret
    this.expiresIn = expiresIn
  }

  generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    // This will be used with Fastify's JWT methods
    // The actual implementation will be handled by Fastify's JWT plugin
    return ''
  }

  verifyToken(token: string): JWTPayload {
    // This will be handled by Fastify's JWT plugin
    throw new Error('Use Fastify JWT methods instead')
  }

  decodeToken(token: string): JWTPayload | null {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload) as JWTPayload
    } catch (error) {
      return null
    }
  }

  isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token)
      if (!decoded || !decoded.exp) return true

      const currentTime = Math.floor(Date.now() / 1000)
      return decoded.exp < currentTime
    } catch (error) {
      return true
    }
  }

  extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) return null

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null

    return parts[1]
  }
}
