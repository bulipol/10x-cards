import { describe, it, expect, vi, beforeEach } from "vitest";
import { FlashcardService, DatabaseError } from "@/lib/flashcard.service";

describe("FlashcardService.validateGenerationIds", () => {
  let inMock: ReturnType<typeof vi.fn>;
  let selectMock: ReturnType<typeof vi.fn>;
  let fromMock: ReturnType<typeof vi.fn>;
  let service: FlashcardService;

  beforeEach(() => {
    inMock = vi.fn();
    selectMock = vi.fn().mockReturnValue({ in: inMock });
    fromMock = vi.fn().mockReturnValue({ select: selectMock });
    const supabase = { from: fromMock };
    service = new FlashcardService(supabase as never);
  });

  it("returns without calling supabase when generationIds is empty", async () => {
    await service.validateGenerationIds([]);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("does not throw when all generation IDs exist", async () => {
    inMock.mockResolvedValue({ count: 2 });
    await service.validateGenerationIds([1, 2]);
    expect(fromMock).toHaveBeenCalledWith("generations");
    expect(selectMock).toHaveBeenCalledWith("id", { count: "exact", head: true });
    expect(inMock).toHaveBeenCalledWith("id", [1, 2]);
  });

  it("deduplicates generation IDs before querying", async () => {
    inMock.mockResolvedValue({ count: 2 });
    await service.validateGenerationIds([1, 2, 2, 1]);
    expect(inMock).toHaveBeenCalledWith("id", [1, 2]);
  });

  it("throws DatabaseError with INVALID_GENERATION_ID when some IDs do not exist", async () => {
    inMock.mockResolvedValue({ count: 1 });
    await expect(service.validateGenerationIds([1, 2])).rejects.toThrow(DatabaseError);
    await expect(service.validateGenerationIds([1, 2])).rejects.toMatchObject({
      code: "INVALID_GENERATION_ID",
      message: "Invalid generation IDs",
    });
  });
});
