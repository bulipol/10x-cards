interface StudySessionProgressProps {
  current: number;
  total: number;
}

export function StudySessionProgress({ current, total }: StudySessionProgressProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-2">
      {/* Text Indicator */}
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-muted-foreground">Progress</span>
        <span className="font-semibold">
          {current} / {total} ({percentage}%)
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
