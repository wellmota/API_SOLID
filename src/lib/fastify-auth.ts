import { FastifyRequest, FastifyReply } from 'fastify'
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
  reply: FastifyReply,
) {
  try {
    // Use Fastify's JWT verification
    await request.jwtVerify()
    
    // Get user data from JWT payload
    const payload = request.user as any
    
    // Verify user still exists in database
    const getUserProfileUseCase = makeGetUserProfileUseCase('prisma')
    const { user } = await getUserProfileUseCase.execute({
      userId: payload.sub,
    })

    // Set user data on request
    request.user = {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    }
  } catch (error) {
    return reply.status(401).send({ error: 'Invalid or expired token' })
  }
}

export async function requireAdmin(
  request: AuthenticatedRequest,
  reply: FastifyReply,
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
