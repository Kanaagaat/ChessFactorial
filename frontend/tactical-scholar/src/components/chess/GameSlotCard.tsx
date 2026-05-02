import { Card, CardContent } from "../ui/Card"
import { Avatar } from "../ui/Avatar"
import { Button } from "../ui/Button"
import { Lock, Clock, BrainCircuit } from "lucide-react"
import { cn } from "../../lib/utils"

export interface GameSlotProps {
  id: string;
  hostName: string;
  hostRating: number;
  gameType: 'Standard' | 'Blitz' | 'Bullet' | 'Factorial';
  timeControl: string;
  isPrivate?: boolean;
  onJoin: (id: string, isPrivate: boolean) => void;
}

export function GameSlotCard({ id, hostName, hostRating, gameType, timeControl, isPrivate, onJoin }: GameSlotProps) {
  return (
    <Card className="card-elevated transition-all hover:-translate-y-0.5">
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar fallback={hostName} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-text-primary">{hostName}</span>
              <span className="text-xs font-semibold bg-text-secondary/10 text-text-secondary px-1.5 py-0.5 rounded">
                {hostRating}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary">
              <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5", gameType === "Factorial" && "bg-primary/10 text-primary")}>
                {gameType === 'Factorial' ? <BrainCircuit className="w-3 h-3 text-primary" /> : <Clock className="w-3 h-3" />}
                {gameType}
              </span>
              <span>{timeControl}</span>
            </div>
          </div>
        </div>
        
        <Button 
          variant="primary" 
          size="sm" 
          className="shrink-0"
          onClick={() => onJoin(id, !!isPrivate)}
        >
          {isPrivate && <Lock className="w-3 h-3 mr-1.5" />}
          Join
        </Button>
      </CardContent>
    </Card>
  )
}
