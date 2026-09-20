/**
 * 19.01 Registration Service
 * --------------------------
 */

import {
  createUser,
  findUserByEmail
} from "./user-service.js";

export interface RegistrationInput {
  email: string;
  password: string;
}

function validateRegistrationInput(
  email: string,
  password: string
): void {
  if (
    typeof email !== "string" ||
    !email.trim()
  ) {
    throw new Error(
      "Email is required"
    );
  }

  const normalizedEmail =
    email.trim().toLowerCase();

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    !emailPattern.test(
      normalizedEmail
    )
  ) {
    throw new Error(
      "Please enter a valid email address"
    );
  }

  if (
    typeof password !== "string"
  ) {
    throw new Error(
      "Password is required"
    );
  }

  if (password.length < 9) {
    throw new Error(
      "Password must be at least 9 characters"
    );
  }

  if (!/[A-Z]/.test(password)) {
    throw new Error(
      "Password must contain at least 1 uppercase letter"
    );
  }

  if (!/[a-z]/.test(password)) {
    throw new Error(
      "Password must contain at least 1 lowercase letter"
    );
  }

  if (!/[0-9]/.test(password)) {
    throw new Error(
      "Password must contain at least 1 number"
    );
  }

  if (!/[^A-Za-z0-9\s]/.test(password)) {
    throw new Error(
      "Password must contain at least 1 symbol"
    );
  }
}

export async function registerUser(
  email: string,
  password: string
) {
  validateRegistrationInput(
    email,
    password
  );

  const normalizedEmail =
    email.trim().toLowerCase();

  if (
    findUserByEmail(
      normalizedEmail
    )
  ) {
    throw new Error(
      "Email already exists"
    );
  }

  return createUser(
    normalizedEmail,
    password,
    "user"
  );
}

export async function registerAdmin(
  email: string,
  password: string
) {
  validateRegistrationInput(
    email,
    password
  );

  const normalizedEmail =
    email.trim().toLowerCase();

  if (
    findUserByEmail(
      normalizedEmail
    )
  ) {
    throw new Error(
      "Email already exists"
    );
  }

  return createUser(
    normalizedEmail,
    password,
    "admin"
  );
}
