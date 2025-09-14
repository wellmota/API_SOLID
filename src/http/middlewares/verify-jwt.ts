import { FastifyRequest, FastifyReply } from 'fastify'
import { makeGetUserProfileUseCase } from '@/use-cases/factories'

export async function verifyJWT(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Use Fastify's JWT verification
    await request.jwtVerify()

    // After jwtVerify(), Fastify sets request.user with the JWT payload
    // We need to verify the user still exists in database
    const getUserProfileUseCase = makeGetUserProfileUseCase('prisma')
    const { user } = await getUserProfileUseCase.execute({
      userId: request.user.sub,
    })

    // Update request.user with fresh data from database
    request.user = {
      sub: user.id,
      email: user.email,
      role: user.role,
    }
  } catch (error) {
    return reply.status(401).send({ error: 'Invalid or expired token' })
  }
}
