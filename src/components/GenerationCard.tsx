import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, Sparkles } from "lucide-react";
import type { GenerationDto } from "@/types";

interface GenerationCardProps {
  generation: GenerationDto;
}

export function GenerationCard({ generation }: GenerationCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (milliseconds: number | null) => {
    if (!milliseconds) return "N/A";
    return `${(milliseconds / 1000).toFixed(2)}s`;
  };

  const formatModelName = (model: string) => {
    // Convert "claude-3-5-sonnet-20241022" to "Claude 3.5 Sonnet"
    if (model.includes("claude")) {
      const parts = model.split("-");
      if (parts[1] && parts[2]) {
        const version = `${parts[1]}.${parts[2]}`;
        const name = parts[3]?.charAt(0).toUpperCase() + parts[3]?.slice(1);
        return `Claude ${version} ${name}`;
      }
    }
    return model;
  };

  return (
    <Card className="p-6 transition-all hover:shadow-md cursor-pointer">
      <a href={`/generations/${generation.id}`} className="block">
        <div className="space-y-4">
        {/* Header: Date and Model */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatDate(generation.created_at)}</span>
          </div>
          <Badge variant="secondary" className="w-fit">
            {formatModelName(generation.model)}
          </Badge>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Generated Count */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Generated</span>
            </div>
            <p className="text-2xl font-bold">{generation.generated_count}</p>
          </div>

          {/* Accepted Unedited */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Accepted (original)</p>
            <p className="text-2xl font-bold text-green-600">{generation.accepted_unedited_count ?? 0}</p>
          </div>

          {/* Accepted Edited */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Accepted (edited)</p>
            <p className="text-2xl font-bold text-blue-600">{generation.accepted_edited_count ?? 0}</p>
          </div>

          {/* Total Accepted */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total accepted</p>
            <p className="text-2xl font-bold">
              {(generation.accepted_unedited_count ?? 0) + (generation.accepted_edited_count ?? 0)}
            </p>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 pt-2 border-t border-border text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            <span>Source: {generation.source_text_length.toLocaleString()} chars</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>Duration: {formatDuration(generation.generation_duration)}</span>
          </div>
        </div>
        </div>
      </a>
    </Card>
  );
}
