import { FastifyRequest, FastifyReply } from 'fastify'
import { JWTService } from './jwt'
import { makeGetUserProfileUseCase } from '@/use-cases/factories'

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    sub: string
    email: string
    role: string
  }
}

export async function authenticate(
  request: AuthenticatedRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return reply.status(401).send({ error: 'Token not provided' })
    }

    const jwtService = new JWTService()
    
    if (jwtService.isTokenExpired(token)) {
      return reply.status(401).send({ error: 'Token expired' })
    }

    const payload = jwtService.verifyToken(token)

    // Verify user still exists
    const getUserProfileUseCase = makeGetUserProfileUseCase('prisma')
    const { user } = await getUserProfileUseCase.execute({
      userId: payload.sub,
    })

    request.user = {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    }
  } catch (error) {
    return reply.status(401).send({ error: 'Invalid token' })
  }
}

export async function requireAdmin(
  request: AuthenticatedRequest,
  reply: FastifyReply
) {
  try {
    // First authenticate the user
    await authenticate(request, reply)

    if (!request.user) {
      return reply.status(401).send({ error: 'Authentication required' })
    }

    if (request.user.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'Admin access required' })
    }
  } catch (error) {
    return reply.status(401).send({ error: 'Authentication failed' })
  }
}
