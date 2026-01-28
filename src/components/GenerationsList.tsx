import { GenerationCard } from "./GenerationCard";
import type { GenerationDto } from "@/types";

interface GenerationsListProps {
  generations: GenerationDto[];
}

export function GenerationsList({ generations }: GenerationsListProps) {
  return (
    <div className="space-y-4">
      {generations.map((generation) => (
        <GenerationCard key={generation.id} generation={generation} />
      ))}
    </div>
  );
}
