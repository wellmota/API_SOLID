import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { makeGetUserProfileUseCase } from '@/use-cases/factories'
import { FastifyRequest, FastifyReply } from 'fastify'

export async function profile(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Authentication is handled by onRequest middleware
    // request.user is already set by verifyJWT middleware
    
    const getUserProfileUseCase = makeGetUserProfileUseCase('prisma')

    const { user } = await getUserProfileUseCase.execute({
      userId: request.user.sub,
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
