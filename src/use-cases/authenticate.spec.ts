import { expect, describe, it, beforeEach } from "vitest";
import { hash } from "bcryptjs";
import { makeAuthenticateUseCaseWithRepository } from "./factories/make-authenticate-use-case";
import { InvalidCredentialsError } from "./errors/invalid-credentials-error";
import { InMemoryUsersRepository } from "@/repositories/in-memory/in-memory-users-repository";

describe("Authenticate Use Case", () => {
  let inMemoryUsersRepository: InMemoryUsersRepository;

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
  });

  it("should be able to authenticate with valid credentials", async () => {
    const password = "123456";
    const passwordHash = await hash(password, 6);

    const testUser = {
      id: "user-1",
      name: "John Doe",
      email: "john.doe@example.com",
      password_hash: passwordHash,
      createdAt: new Date(),
    };

    inMemoryUsersRepository.items.push(testUser);

    const authenticateUseCase = makeAuthenticateUseCaseWithRepository(
      inMemoryUsersRepository,
    );

    const { user } = await authenticateUseCase.execute({
      email: "john.doe@example.com",
      password: "123456",
    });

    expect(user.id).toBe("user-1");
    expect(user.name).toBe("John Doe");
    expect(user.email).toBe("john.doe@example.com");
  });

  it("should not be able to authenticate with wrong email", async () => {
    const password = "123456";
    const passwordHash = await hash(password, 6);

    const testUser = {
      id: "user-1",
      name: "John Doe",
      email: "john.doe@example.com",
      password_hash: passwordHash,
      createdAt: new Date(),
    };

    inMemoryUsersRepository.items.push(testUser);

    const authenticateUseCase = makeAuthenticateUseCaseWithRepository(
      inMemoryUsersRepository,
    );

    await expect(() =>
      authenticateUseCase.execute({
        email: "wrong.email@example.com",
        password: "123456",
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("should not be able to authenticate with wrong password", async () => {
    const password = "123456";
    const passwordHash = await hash(password, 6);

    const testUser = {
      id: "user-1",
      name: "John Doe",
      email: "john.doe@example.com",
      password_hash: passwordHash,
      createdAt: new Date(),
    };

    inMemoryUsersRepository.items.push(testUser);

    const authenticateUseCase = makeAuthenticateUseCaseWithRepository(
      inMemoryUsersRepository,
    );

    await expect(() =>
      authenticateUseCase.execute({
        email: "john.doe@example.com",
        password: "wrong-password",
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("should not be able to authenticate with non-existent user", async () => {
    const authenticateUseCase = makeAuthenticateUseCaseWithRepository(
      inMemoryUsersRepository,
    );

    await expect(() =>
      authenticateUseCase.execute({
        email: "nonexistent@example.com",
        password: "123456",
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("should not be able to authenticate with empty email", async () => {
    const authenticateUseCase = makeAuthenticateUseCaseWithRepository(
      inMemoryUsersRepository,
    );

    await expect(() =>
      authenticateUseCase.execute({
        email: "",
        password: "123456",
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("should not be able to authenticate with empty password", async () => {
    const password = "123456";
    const passwordHash = await hash(password, 6);

    const testUser = {
      id: "user-1",
      name: "John Doe",
      email: "john.doe@example.com",
      password_hash: passwordHash,
      createdAt: new Date(),
    };

    inMemoryUsersRepository.items.push(testUser);

    const authenticateUseCase = makeAuthenticateUseCaseWithRepository(
      inMemoryUsersRepository,
    );

    await expect(() =>
      authenticateUseCase.execute({
        email: "john.doe@example.com",
        password: "",
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("should authenticate correctly when multiple users exist", async () => {
    const password1 = "123456";
    const password2 = "654321";
    const passwordHash1 = await hash(password1, 6);
    const passwordHash2 = await hash(password2, 6);

    const user1 = {
      id: "user-1",
      name: "John Doe",
      email: "john.doe@example.com",
      password_hash: passwordHash1,
      createdAt: new Date(),
    };

    const user2 = {
      id: "user-2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      password_hash: passwordHash2,
      createdAt: new Date(),
    };

    inMemoryUsersRepository.items.push(user1, user2);

    const authenticateUseCase = makeAuthenticateUseCaseWithRepository(
      inMemoryUsersRepository,
    );

    const { user } = await authenticateUseCase.execute({
      email: "jane.smith@example.com",
      password: "654321",
    });

    expect(user.id).toBe("user-2");
    expect(user.name).toBe("Jane Smith");
    expect(user.email).toBe("jane.smith@example.com");
  });
});
