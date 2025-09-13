import { User } from '@prisma/client'
import { UsersRepository } from '@/repositories/users-repository'
import { InvalidCredentialsError } from './errors/invalid-credentials-error'
import { compare } from 'bcryptjs'
import { JWTService } from '@/lib/jwt'

interface AuthenticateUseCaseRequest {
  email: string
  password: string
}

interface AuthenticateUseCaseResponse {
  user: User
  token: string
}

export class AuthenticateUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JWTService,
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(email)

    if (!user) {
      throw new InvalidCredentialsError()
    }

    const doesPasswordMatches = await compare(password, user.password_hash)

    if (!doesPasswordMatches) {
      throw new InvalidCredentialsError()
    }

    // Generate JWT token
    const token = this.jwtService.generateToken({
      sub: user.id,
      email: user.email,
      role: user.role || 'USER',
    })

    return {
      user,
      token,
    }
  }
}
