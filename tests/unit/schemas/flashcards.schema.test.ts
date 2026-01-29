import { describe, it, expect } from "vitest";
import {
  flashcardsQuerySchema,
  flashcardIdSchema,
  flashcardUpdateSchema,
} from "@/lib/schemas/flashcards.schema";

function getFirstMessage(result: {
  success: false;
  error: { issues: { message: string }[] };
}): string {
  return result.error.issues[0]?.message ?? "";
}

describe("flashcardsQuerySchema", () => {
  it("applies defaults when given empty object", () => {
    const result = flashcardsQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(10);
      expect(result.data.sort).toBe("created_at");
      expect(result.data.order).toBe("desc");
      expect(result.data.source).toBeUndefined();
      expect(result.data.generation_id).toBeUndefined();
    }
  });

  it("accepts valid page, limit, sort, and order", () => {
    const input = {
      page: 2,
      limit: 20,
      sort: "updated_at" as const,
      order: "asc" as const,
    };
    const result = flashcardsQuerySchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(20);
      expect(result.data.sort).toBe("updated_at");
      expect(result.data.order).toBe("asc");
    }
  });

  it("accepts optional source enum values", () => {
    for (const source of ["ai-full", "ai-edited", "manual"] as const) {
      const result = flashcardsQuerySchema.safeParse({ source });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.source).toBe(source);
    }
  });

  it("accepts optional positive generation_id", () => {
    const result = flashcardsQuerySchema.safeParse({ generation_id: 5 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.generation_id).toBe(5);
  });

  it("coerces string page, limit, and generation_id to numbers", () => {
    const result = flashcardsQuerySchema.safeParse({
      page: "3",
      limit: "15",
      generation_id: "7",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(15);
      expect(result.data.generation_id).toBe(7);
    }
  });

  it("rejects page less than 1", () => {
    const result = flashcardsQuerySchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects limit less than 1", () => {
    const result = flashcardsQuerySchema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects limit greater than 100", () => {
    const result = flashcardsQuerySchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid sort value", () => {
    const result = flashcardsQuerySchema.safeParse({ sort: "invalid" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid order value", () => {
    const result = flashcardsQuerySchema.safeParse({ order: "invalid" });
    expect(result.success).toBe(false);
  });
});

describe("flashcardIdSchema", () => {
  it("accepts positive integer id", () => {
    const result = flashcardIdSchema.safeParse({ id: 42 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.id).toBe(42);
  });

  it("coerces string id to number", () => {
    const result = flashcardIdSchema.safeParse({ id: "7" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.id).toBe(7);
  });

  it("rejects zero", () => {
    const result = flashcardIdSchema.safeParse({ id: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative id", () => {
    const result = flashcardIdSchema.safeParse({ id: -1 });
    expect(result.success).toBe(false);
  });
});

describe("flashcardUpdateSchema", () => {
  it("rejects empty object (refine: at least one field)", () => {
    const result = flashcardUpdateSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(getFirstMessage(result)).toBe("At least one field must be provided");
    }
  });

  it("accepts partial update with front only", () => {
    const result = flashcardUpdateSchema.safeParse({ front: "Question?" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.front).toBe("Question?");
  });

  it("accepts partial update with back only", () => {
    const result = flashcardUpdateSchema.safeParse({ back: "Answer." });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.back).toBe("Answer.");
  });

  it("accepts partial update with source enum", () => {
    const result = flashcardUpdateSchema.safeParse({ source: "manual" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.source).toBe("manual");
  });

  it("accepts partial update with generation_id (number or null)", () => {
    const resultNum = flashcardUpdateSchema.safeParse({ generation_id: 10 });
    expect(resultNum.success).toBe(true);
    if (resultNum.success) expect(resultNum.data.generation_id).toBe(10);

    const resultNull = flashcardUpdateSchema.safeParse({ generation_id: null });
    expect(resultNull.success).toBe(true);
    if (resultNull.success) expect(resultNull.data.generation_id).toBeNull();
  });

  it("rejects front longer than 200 characters", () => {
    const result = flashcardUpdateSchema.safeParse({
      front: "a".repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it("rejects back longer than 500 characters", () => {
    const result = flashcardUpdateSchema.safeParse({
      back: "a".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid source value", () => {
    const result = flashcardUpdateSchema.safeParse({ source: "invalid" });
    expect(result.success).toBe(false);
  });
});
