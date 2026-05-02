import { Card } from "../ui/Card";
import type { MatchHistoryItem } from "../../types/domain";

export function HistoryRow({ item }: { item: MatchHistoryItem }) {
  const deltaTone = item.ratingChange > 0 ? "text-primary" : item.ratingChange < 0 ? "text-danger" : "text-text-secondary";
  return (
    <Card className="card-elevated p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{item.opponent}</p>
          <p className="text-sm text-text-secondary">
            {item.gameType} • {item.playedAt}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold">{item.result}</p>
          <p className={`text-sm ${deltaTone}`}>{item.ratingChange > 0 ? `+${item.ratingChange}` : item.ratingChange}</p>
        </div>
      </div>
    </Card>
  );
}
