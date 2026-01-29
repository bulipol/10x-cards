import { describe, it, expect } from "vitest";
import {
  generationsPaginationSchema,
  generationIdSchema,
} from "@/lib/schemas/generations.schema";

describe("generationsPaginationSchema", () => {
  it("applies defaults when given empty object", () => {
    const result = generationsPaginationSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(10);
    }
  });

  it("accepts valid page and limit", () => {
    const input = { page: 2, limit: 20 };
    const result = generationsPaginationSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }
  });

  it("coerces string page and limit to numbers", () => {
    const result = generationsPaginationSchema.safeParse({
      page: "5",
      limit: "25",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(5);
      expect(result.data.limit).toBe(25);
    }
  });

  it("rejects page less than 1", () => {
    const result = generationsPaginationSchema.safeParse({
      page: 0,
      limit: 10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects limit less than 1", () => {
    const result = generationsPaginationSchema.safeParse({
      page: 1,
      limit: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects limit greater than 100", () => {
    const result = generationsPaginationSchema.safeParse({
      page: 1,
      limit: 101,
    });
    expect(result.success).toBe(false);
  });
});

describe("generationIdSchema", () => {
  it("accepts positive integer id", () => {
    const input = { id: 42 };
    const result = generationIdSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }
  });

  it("coerces string id to number", () => {
    const result = generationIdSchema.safeParse({ id: "7" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(7);
    }
  });

  it("rejects zero", () => {
    const result = generationIdSchema.safeParse({ id: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative id", () => {
    const result = generationIdSchema.safeParse({ id: -1 });
    expect(result.success).toBe(false);
  });
});
