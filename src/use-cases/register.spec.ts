import { expect, describe, it } from "vitest";
import { compare } from "bcryptjs";
import { makeRegisterUseCase } from "./factories";
import { UserAlreadyExistsError } from "./errors/user-already-exists-error";

describe("Register Use Case", () => {
  it("should hash user password upon registration", async () => {
    const registerUseCase = makeRegisterUseCase('in-memory');
    
    const userData = {
      name: "John Doe",
      email: "john.doe@example.com",
      password: "123456",
    };

    const { user } = await registerUseCase.execute(userData);

    await expect(user.password_hash).toBeDefined();
    await expect(user.password_hash).not.toBe(userData.password); // Password should be hashed
    await expect(user.password_hash).toHaveLength(60); // bcrypt hash length

    const isPasswordCorrectlyHashed = await compare(
      "123456",
      user.password_hash,
    );

    console.log(user.password_hash);

    await  expect(isPasswordCorrectlyHashed).toBe(true);
  });

  it("should throw error if email already exists", async () => {
    const registerUseCase = makeRegisterUseCase('in-memory');
    
    const userData = {
      name: "John Doe",
      email: "john.doe@example.com",
      password: "123456",
    };

    // First registration should succeed
    await registerUseCase.execute(userData);

    // Second registration with same email should fail
    await expect(registerUseCase.execute(userData)).rejects.toBeInstanceOf(
      UserAlreadyExistsError,
    );
  });
});
