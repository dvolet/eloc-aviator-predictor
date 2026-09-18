import { describe, expect, it } from "vitest";

import { db } from "../database/database.js";

import {
  deleteUser
} from "./admin-user-deletion-service.js";

describe(
  "Admin user deletion",
  () => {
    it(
      "deletes a normal user successfully",
      () => {
        const result =
          db.prepare(`
            INSERT INTO users (
              email,
              password_hash,
              role,
              is_active
            )
            VALUES (?, ?, ?, ?)
          `).run(
            "deletion-test@example.com",
            "test-hash",
            "user",
            1
          );

        const testUserId =
          Number(result.lastInsertRowid);

        const deleted =
          deleteUser(
            testUserId,
            2
          );

        expect(deleted).toBe(true);

        const user =
          db.prepare(`
            SELECT id
            FROM users
            WHERE id = ?
          `).get(testUserId);

        expect(user).toBeUndefined();
      }
    );

    it(
      "prevents an admin from deleting themselves",
      () => {
        const result =
          deleteUser(2, 2);

        expect(result).toBe(false);
      }
    );

    it(
      "prevents deletion of an admin account",
      () => {
        const result =
          deleteUser(2, 1);

        expect(result).toBe(false);
      }
    );

    it(
      "returns false for a nonexistent user",
      () => {
        const result =
          deleteUser(999999, 2);

        expect(result).toBe(false);
      }
    );
  }
);
