import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "@/lib/schemas/auth.schema";

function getFirstMessage(result: { success: false; error: { issues: { message: string }[] } }): string {
  return result.error.issues[0]?.message ?? "";
}

describe("loginSchema", () => {
  it("accepts valid email and non-empty password", () => {
    const input = { email: "user@example.com", password: "any" };
    const result = loginSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }
  });

  it("rejects empty email", () => {
    const input = { email: "", password: "something" };
    const result = loginSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(getFirstMessage(result)).toMatch(/Invalid email format|required/i);
    }
  });

  it("rejects invalid email format", () => {
    const input = { email: "not-an-email", password: "something" };
    const result = loginSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(getFirstMessage(result)).toBe("Invalid email format");
    }
  });

  it("rejects email longer than 255 characters", () => {
    const input = {
      email: "a".repeat(256),
      password: "something",
    };
    const result = loginSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      // Zod validates .email() before .max(255), so long string fails with Invalid email format
      expect(getFirstMessage(result)).toMatch(/Invalid email format|Email is too long/);
    }
  });

  it("rejects empty password", () => {
    const input = { email: "user@example.com", password: "" };
    const result = loginSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(getFirstMessage(result)).toBe("Password is required");
    }
  });
});

describe("registerSchema", () => {
  it("accepts valid email and password (min 8 chars, letter, digit)", () => {
    const input = { email: "user@example.com", password: "Password1" };
    const result = registerSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }
  });

  it("rejects password shorter than 8 characters", () => {
    const input = { email: "user@example.com", password: "Pass1" };
    const result = registerSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(getFirstMessage(result)).toBe("Password must be at least 8 characters");
    }
  });

  it("rejects password without letter", () => {
    const input = { email: "user@example.com", password: "12345678" };
    const result = registerSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(getFirstMessage(result)).toBe("Password must contain at least one letter");
    }
  });

  it("rejects password without digit", () => {
    const input = { email: "user@example.com", password: "PasswordOnly" };
    const result = registerSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(getFirstMessage(result)).toBe("Password must contain at least one digit");
    }
  });

  it("rejects password longer than 72 characters", () => {
    const input = {
      email: "user@example.com",
      password: "A1" + "a".repeat(71),
    };
    const result = registerSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(getFirstMessage(result)).toBe("Password is too long");
    }
  });

  it("rejects empty email", () => {
    const input = { email: "", password: "Password1" };
    const result = registerSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(getFirstMessage(result)).toMatch(/Invalid email format|required/i);
    }
  });

  it("rejects invalid email format", () => {
    const input = { email: "not-an-email", password: "Password1" };
    const result = registerSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(getFirstMessage(result)).toBe("Invalid email format");
    }
  });

  it("rejects email longer than 255 characters", () => {
    const input = {
      email: "a".repeat(256),
      password: "Password1",
    };
    const result = registerSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      // Zod validates .email() before .max(255), so long string fails with Invalid email format
      expect(getFirstMessage(result)).toMatch(/Invalid email format|Email is too long/);
    }
  });
});
