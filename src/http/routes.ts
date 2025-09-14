import { FastifyInstance } from 'fastify'
import { register } from '@/http/controllers/register'
import { authenticate } from '@/http/controllers/authenticate'
import { profile } from '@/http/controllers/profile'
import { authenticate as authMiddleware } from '@/lib/fastify-auth'


export async function appRoutes(app: FastifyInstance) {
  app.post('/users', register)
  app.post('/sessions', authenticate)

  /**
   * Authenticated routes
   */
  app.get('/me', { preHandler: authMiddleware }, profile)
}