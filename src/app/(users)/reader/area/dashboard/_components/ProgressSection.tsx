import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SectionProgress } from "@/lib/api/types";

interface Props {
  title: string;
  books: string;
  finishedLabel: string;
  pendingLabel: string;
  progress: SectionProgress;
}

export function ProgressSection({ title, books, finishedLabel, pendingLabel, progress }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 px-2">
              <p>{books}</p>
            </div>
            <Badge>{progress.pct}%</Badge>
          </div>
          <Progress value={progress.pct} />
          {progress.finished && <p className="text-green-600 font-medium">{finishedLabel}</p>}
          {!progress.finished && progress.finishedByMarkers && (
            <p className="text-amber-600">{pendingLabel}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
