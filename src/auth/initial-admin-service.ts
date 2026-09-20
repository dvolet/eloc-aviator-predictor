/**
 * 20.38 Initial Administrator Setup Service
 * -----------------------------------------
 */

import {
  getUserCount
} from "./user-service.js";

import {
  registerAdmin
} from "./registration-service.js";

export async function registerInitialAdmin(
  email: string,
  password: string
) {
  const userCount =
    getUserCount();

  if (userCount > 0) {
    throw new Error(
      "Initial administrator setup is already complete"
    );
  }

  return registerAdmin(
    email,
    password
  );
}
