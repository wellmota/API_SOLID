import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { makeGetUserProfileUseCase } from '@/use-cases/factories'
import { FastifyRequest, FastifyReply } from 'fastify'
import { authenticate, AuthenticatedRequest } from '@/lib/fastify-auth'

export async function profile(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Authenticate the user first
    await authenticate(request as AuthenticatedRequest, reply)
    
    const getUserProfileUseCase = makeGetUserProfileUseCase('prisma')
    
    const { user } = await getUserProfileUseCase.execute({
      userId: (request as AuthenticatedRequest).user!.sub,
    })

    return reply.status(200).send({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
    })
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    throw err
  }
}
