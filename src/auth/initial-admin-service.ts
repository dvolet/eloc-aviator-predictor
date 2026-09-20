/**
 * 20.38 Initial Administrator Setup Service
 * -----------------------------------------
 */

import {
  getAdminCount
} from "./user-service.js";

import {
  registerAdmin
} from "./registration-service.js";

export async function registerInitialAdmin(
  email: string,
  password: string
) {
  const adminCount =
    getAdminCount();

  if (adminCount > 0) {
    throw new Error(
      "Initial administrator setup is already complete"
    );
  }

  return registerAdmin(
    email,
    password
  );
}
