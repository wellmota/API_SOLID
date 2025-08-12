# Use Case Factories

This directory contains factory implementations for creating use cases with different repository types.

## Overview

The factory pattern provides a clean way to instantiate use cases with the appropriate dependencies, making your code more maintainable and testable.

## Available Factories

### 1. RegisterUseCaseFactory

Creates instances of `RegisterUseCase` with different repository implementations.

### 2. AuthenticateUseCaseFactory

Creates instances of `AuthenticateUseCase` with different repository implementations.

## Usage Examples

### In Controllers (Production)

```typescript
import {
  makeRegisterUseCase,
  makeAuthenticateUseCase,
} from '@/use-cases/factories'

// Use Prisma repository (default)
const registerUseCase = makeRegisterUseCase('prisma')
const authenticateUseCase = makeAuthenticateUseCase('prisma')

// Or explicitly specify
const registerUseCase = makeRegisterUseCase('prisma')
const authenticateUseCase = makeAuthenticateUseCase('prisma')
```

### In Tests

```typescript
import {
  makeRegisterUseCase,
  makeAuthenticateUseCase,
} from '@/use-cases/factories'

// Use in-memory repository for testing
const registerUseCase = makeRegisterUseCase('in-memory')
const authenticateUseCase = makeAuthenticateUseCase('in-memory')
```

### Using Factory Classes Directly

```typescript
import {
  RegisterUseCaseFactory,
  AuthenticateUseCaseFactory,
} from '@/use-cases/factories'

const registerFactory = new RegisterUseCaseFactory()
const authenticateFactory = new AuthenticateUseCaseFactory()

const registerUseCase = registerFactory.create('prisma')
const authenticateUseCase = authenticateFactory.create('in-memory')
```

## Repository Types

- **`'prisma'`**: Uses `PrismaUsersRepository` for production database operations
- **`'in-memory'`**: Uses `InMemoryUsersRepository` for testing and development

## Benefits

1. **Dependency Injection**: Clean separation of concerns
2. **Testability**: Easy to swap implementations for testing
3. **Maintainability**: Centralized creation logic
4. **Type Safety**: TypeScript ensures correct repository types
5. **Flexibility**: Easy to add new repository implementations

## Adding New Use Cases

To add a new use case factory:

1. Create a new factory class extending `BaseUseCaseFactory`
2. Implement the `create` method
3. Export the factory and factory function
4. Update the index file

Example:

```typescript
export class NewUseCaseFactory extends BaseUseCaseFactory {
  create(type: RepositoryType = 'prisma'): NewUseCase {
    const usersRepository = this.createRepository(type)
    return new NewUseCase(usersRepository)
  }
}

export function makeNewUseCase(
  repositoryType: RepositoryType = 'prisma'
): NewUseCase {
  const factory = new NewUseCaseFactory()
  return factory.create(repositoryType)
}
```
