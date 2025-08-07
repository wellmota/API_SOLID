import { expect, describe, it, beforeEach } from "vitest";
import { compare } from "bcryptjs";
import { RegisterUseCase } from "./register";
import { UserAlreadyExistsError } from "./errors/user-already-exists-error";
import { UsersRepository } from "@/repositories/users-repository";

describe("Register Use Case", () => {
  let registerUseCase: RegisterUseCase;
  let mockUsersRepository: UsersRepository;

  beforeEach(() => {
    // Create a simple mock repository
    mockUsersRepository = {
      findByEmail: async () => null, // Default: no user exists
      create: async (data) => ({
        id: "user-1",
        name: data.name,
        email: data.email,
        password_hash: data.password_hash || "",
        createdAt: new Date(),
      }),
    };

    registerUseCase = new RegisterUseCase(mockUsersRepository);
  });

  it("should hash user password upon registration", async () => {
    const userData = {
      name: "John Doe",
      email: "john.doe@example.com",
      password: "123456",
    };

    const { user } = await registerUseCase.execute(userData);

    expect(user.password_hash).toBeDefined();
    expect(user.password_hash).not.toBe(userData.password); // Password should be hashed
    expect(user.password_hash).toHaveLength(60); // bcrypt hash length

    const isPasswordCorrectlyHashed = await compare(
      "123456",
      user.password_hash,
    );

    console.log(user.password_hash);

    expect(isPasswordCorrectlyHashed).toBe(true);
  });

  it("should throw error if email already exists", async () => {
    // Override the mock to simulate existing user
    mockUsersRepository.findByEmail = async () => ({
      id: "existing-user-1",
      name: "Existing User",
      email: "john.doe@example.com",
      password_hash: "existing_hash",
      createdAt: new Date(),
    });

    const userData = {
      name: "John Doe",
      email: "john.doe@example.com",
      password: "123456",
    };

    await expect(registerUseCase.execute(userData)).rejects.toBeInstanceOf(
      UserAlreadyExistsError,
    );
  });
});
