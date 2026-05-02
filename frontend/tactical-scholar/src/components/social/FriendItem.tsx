import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import type { Friend } from "../../types/domain";

interface FriendItemProps {
  friend: Friend;
  onInvite: (friendId: string) => void;
}

export function FriendItem({ friend, onInvite }: FriendItemProps) {
  return (
    <Card className="card-elevated p-4 transition-all hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar fallback={friend.username} />
          <div>
            <p className="font-medium">{friend.username}</p>
            <p className="text-sm text-text-secondary">
              {friend.rating} • {friend.status === "online" ? "Online" : `Last seen ${friend.lastSeen ?? "recently"}`}
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => onInvite(friend.id)} disabled={friend.status !== "online"}>
          Invite
        </Button>
      </div>
    </Card>
  );
}
